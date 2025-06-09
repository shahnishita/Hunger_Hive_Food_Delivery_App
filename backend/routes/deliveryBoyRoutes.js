import express from 'express';
import { getAllDeliveryBoys, createDeliveryBoy } from '../controllers/deliveryBoyController.js';

const router = express.Router();

router.get('/', getAllDeliveryBoys);     // GET /api/deliveryboys/
router.post('/', createDeliveryBoy);     // POST /api/deliveryboys/

export default router;
