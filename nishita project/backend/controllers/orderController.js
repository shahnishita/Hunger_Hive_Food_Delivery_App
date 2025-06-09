import express  from "express";
import Ordermodel from "../models/OrderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    const { items, amount, address } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
const cleanItems = items.map(({ name, quantity, price }) => ({
  name,
  quantity,
  price
}));

const newOrder = new Ordermodel({
  userId,
  items: cleanItems,  // ✅ Use cleaned items (no _id)
  amount,
  address,
});

    

    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // ₹ to paise
      },
      quantity: item.quantity,
    }));

    // Add delivery charge (fixed ₹160)
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 160 * 100,
      },
      quantity: 1,
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
      client_reference_id: newOrder._id.toString(),
      metadata: {
        userId: userId.toString(),
        orderId: newOrder._id.toString(),
      },
    });

    // Respond with session URL
    res.status(200).json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Order placement failed", error });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID missing" });
    }

    if (success !== "true") {
      return res.status(400).json({ success: false, message: "Payment not successful" });
    }

    await Ordermodel.findByIdAndUpdate(orderId, { payment: true });

    console.log("✅ Payment verified for order:", orderId);

    res.status(200).json({ success: true, message: "Payment Verified" });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

export const userOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    console.log("User ID from token:", userId); // <--- Check this in your backend logs

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const orders = await Ordermodel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Listing orders for admin panel
export const listOrders = async (req,res)=>{
  try{
    const orders = await Ordermodel.find({});
    res.json({success:true,data:orders})
  }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}
//api for updating status
export const updatestatus = async(req,res)=>{
  try{
    await Ordermodel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
  } catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}
export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;

    // 🧠 Use 'assignedDeliveryBoy' instead of 'deliveryBoyId'
    const updatedOrder = await Ordermodel.findByIdAndUpdate(
      orderId,
      { assignedDeliveryBoy: deliveryBoyId },
      { new: true }
    ).populate("assignedDeliveryBoy");

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error("❌ Assign delivery boy error:", error);
    res.status(500).json({ success: false, message: "Failed to assign delivery boy" });
  }
};
