import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  // Promo code string like "SAVE10"
  discountType: { type: String, enum: ['fixed', 'percentage'], required: true }, // Type of discount: fixed amount or percentage
  discountValue: { type: Number, required: true },       // The actual discount amount or percentage
  expiryDate: { type: Date, required: true }             // Expiry date after which promo code is invalid
});

const PromoCode = mongoose.models.PromoCode || mongoose.model('PromoCode', promoCodeSchema);
export default PromoCode;
