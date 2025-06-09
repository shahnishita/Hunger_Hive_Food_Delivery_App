// deliveryBoyController.js
import DeliveryBoy from '../models/DeliveryBoyModel.js';
import Ordermodel from '../models/OrderModel.js';

export const getAllDeliveryBoys = async (req, res) => {
  try {
    const deliveryBoys = await DeliveryBoy.find();
    res.status(200).json({ data: deliveryBoys });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch delivery boys' });
  }
};

export const createDeliveryBoy = async (req, res) => {
  try {
    const { name, phone, address, instructions } = req.body;
    const newBoy = new DeliveryBoy({ name, phone, address, instructions });
    await newBoy.save();
    res.status(201).json({ success: true, data: newBoy });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create delivery boy' });
  }
};

