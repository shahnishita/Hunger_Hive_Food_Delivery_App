// routes/locationRoutes.js
import express from 'express';
import { reverseGeocode } from '../controllers/locationController.js';

const router = express.Router();

// Route: GET /api/location/reverse?lat=18.4892&lon=73.8162
router.get('/reverse', reverseGeocode);

export default router;
