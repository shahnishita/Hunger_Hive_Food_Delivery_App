import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updatestatus,
  assignDeliveryBoy,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// Order placement & verification
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);

// Order fetch operations
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);

// Order status update
orderRouter.post("/status", updatestatus);

// ✅ Assign delivery boy to order
orderRouter.put("/assign-deliveryboy", assignDeliveryBoy);
orderRouter.get('/:orderId', async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Ordermodel.findById(orderId).populate('assignedDeliveryBoy');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
export default orderRouter;
