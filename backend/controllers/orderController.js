import express from "express";
import Ordermodel from "../models/OrderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { getDistanceFromLatLonInKm } from '../../shared/utils/distance.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const shopLocation = {
  latitude: 19.12345,  // Replace with your actual shop latitude
  longitude: 73.12345, // Replace with your actual shop longitude
};

export const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    // Validate authenticated user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Validate request body
    const { items, amount, address, deliveryFee } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Items are required" });
    }
    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    if (
  !address ||
  typeof address !== "object" ||
  !address.street ||
  !address.country
) {
  return res.status(400).json({ success: false, message: "Invalid address" });
}

    if (typeof deliveryFee !== "number" || deliveryFee < 0) {
      return res.status(400).json({ success: false, message: "Invalid delivery fee" });
    }

    // Clean items to avoid _id or unwanted fields being stored
    const cleanItems = items.map(({ name, quantity, price }) => ({
      name,
      quantity,
      price,
    }));
    // Create new order in database
    const newOrder = new Ordermodel({
      userId,
      items: cleanItems,
      amount,
      address,
      payment: false,    // default payment status false
      status: "FoodProcessing", // default order status
      deliveryFee,
    });

    await newOrder.save();

    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });
console.log("delivery fee",deliveryFee)

    // Prepare Stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100), // Convert ₹ to paise and round
      },
      quantity: item.quantity,
    }));
    const fee = typeof deliveryFee === "number" && deliveryFee > 0 ? deliveryFee : 50;

if (deliveryFee > 0) {
  line_items.push({
    price_data: {
      currency: "inr",
      product_data: {
        name: "Delivery Fee",
      },
      unit_amount: Math.round(deliveryFee * 100), // ₹100 → 10000 paise
    },
      quantity: 1,

  });
}


console.log("Line Items to Stripe:", JSON.stringify(line_items, null, 2));

    // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items, // includes products + delivery
  mode: 'payment',
  success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
  cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
  client_reference_id: newOrder._id.toString(),
  metadata: {
    userId: userId.toString(),
    orderId: newOrder._id.toString(),
  },
});


    // Send Stripe session URL back to frontend
    res.status(200).json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: "Order placement failed",
      error: error.message, // Only send error message, not full error object
    });
  }
};

export const calculateDeliveryFee = (userLat, userLon) => {
  const distance = getDistanceFromLatLonInKm(userLat, userLon, shopLocation.latitude, shopLocation.longitude);
  console.log('Distance:', distance);

  if (distance > 4) {
    return 100;  // Return a number, no React here
  } else {
    return 50;
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
    res.status(500).json({ success: false, message: "Payment verification failed", error: error.message });
  }
};

export const userOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID required" });
    }

    const orders = await Ordermodel.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

export const listOrders = async (req, res) => {
  try {
    const orders = await Ordermodel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error listing orders:", error);
    res.json({ success: false, message: "Error", error: error.message });
  }
};

export const updatestatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ success: false, message: "orderId and status required" });
    }
    await Ordermodel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.json({ success: false, message: "Error", error: error.message });
  }
};

export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId, deliveryBoyId } = req.body;
    if (!orderId || !deliveryBoyId) {
      return res.status(400).json({ success: false, message: "orderId and deliveryBoyId required" });
    }

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
    console.error("Error assigning delivery boy:", error);
    res.status(500).json({ success: false, message: "Failed to assign delivery boy", error: error.message });
  }
};
