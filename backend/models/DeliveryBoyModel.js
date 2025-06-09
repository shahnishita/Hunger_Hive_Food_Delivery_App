// ✅ Correct way in deliveryBoyModel.js
import mongoose from 'mongoose';
import Order from './OrderModel.js'; // Import safely if needed

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  phone: String,
  address: String,
  instructions: String,
});

const DeliveryBoy = mongoose.models.DeliveryBoy || mongoose.model('DeliveryBoy', deliveryBoySchema);
export default DeliveryBoy;
