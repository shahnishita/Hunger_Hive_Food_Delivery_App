import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },

    cartData: {
      type: Map,
      of: Number,
      default: {}   // ✅ Correct way to default a Map field
    }
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
