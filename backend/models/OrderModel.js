import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        _id: false,            // 🛠️ Tell Mongoose not to create/expect _id
        name: String,
        quantity: Number,
        price: Number          // 🛠️ Include price since you're using it in Stripe
      },
    ],
    amount: { type: Number, required: true },
    status: { type: String, default: "Food Processing" },
    address: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      state: String,
      country: String,
      zipcode: String,
      phone: String,
    },
    payment: { type: Boolean, default: false },
    assignedDeliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliveryBoy",
      default: null,
    },
  },
  { timestamps: true }
);

// ✅ Safe export without OverwriteModelError
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
