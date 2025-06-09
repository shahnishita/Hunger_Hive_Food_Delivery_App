// controllers/cartController.js
import userModel from '../models/userModel.js';
// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ success: false, message: "Invalid inputs" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.cartData) {
      user.cartData = {};
    }

    const currentQty = user.cartData.get(productId) || 0;
    // Since user.cartData is a Map, you can still use .get() and .set()
    // But to avoid issues, better convert it to a plain object:

    // Convert Map to plain object if needed
    let cartObj = user.cartData instanceof Map ? Object.fromEntries(user.cartData) : user.cartData;

    cartObj[productId] = (cartObj[productId] || 0) + quantity;

    // Update cartData as Map from the updated plain object
    user.cartData = new Map(Object.entries(cartObj));

    await user.save();

    res.status(200).json({ success: true, message: "Item added to cart", cartData: cartObj });
  } catch (error) {
    console.error("Error in addToCart:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Clear the cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.cartData = new Map();

    await user.save();

    res.json({ success: true, message: "Cart cleared successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get cart
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Convert Map to plain object for response
    const cartObj = user.cartData instanceof Map ? Object.fromEntries(user.cartData) : user.cartData || {};

    res.status(200).json({ success: true, cartData: cartObj });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
export const applyPromoCode = async (req, res) => {
  try {
    const { promoCode } = req.body;  // Extract promo code from client request

    if (!promoCode) {
      return res.status(400).json({ success: false, message: 'Promo code is required' });
    }

    // Search DB for promo code (case-insensitive by converting to uppercase)
    const promo = await PromoCode.findOne({ code: promoCode.toUpperCase() });

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Invalid promo code' });
    }

    // Check if promo code expired
    if (promo.expiryDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo code expired' });
    }

    // If promo valid, send back discount info
    return res.status(200).json({
      success: true,
      discountType: promo.discountType,   // 'fixed' or 'percentage'
      discountValue: promo.discountValue  // numeric discount amount
    });

  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const saveOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartData, location } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.cartData = cartData;
    user.address = location;

    await user.save();

    res.status(200).json({ success: true, message: "Order placed successfully", location });
  } catch (err) {
    console.error("Order placement error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


