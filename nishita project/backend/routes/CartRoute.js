import express from "express"
import { addToCart, clearCart, getCart,applyPromoCode } from "../controllers/cartController.js";
import authMiddleware from "../middleware/auth.js"
const cartRouter = express.Router();
cartRouter.post("/add-to-cart", authMiddleware, addToCart);
cartRouter.post('/cart/clear', authMiddleware, clearCart);
cartRouter.post("/get",authMiddleware,getCart)
cartRouter.post("/apply-promo", authMiddleware, applyPromoCode);

export default cartRouter;