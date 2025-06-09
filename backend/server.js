// server.js
import 'dotenv/config';  // or require('dotenv').config();
console.log("Loaded STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY);
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js'; // Your DB connection function
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userroute.js';
import cartRouter from './routes/CartRoute.js';
import orderRouter from './routes/OrderRoute.js'; // or wherever your router file is
import locationRoutes from './routes/LocationRoutes.js'; // ✅ Correct import
import deliveryBoyRoutes from "./routes/deliveryBoyRoutes.js"; // ✅ Import this

const app = express();
const port = process.env.PORT || 4000; // Use PORT from env or default 4000

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('API WORKING');
});

// API Routes
app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);
app.use('/api/cart', cartRouter);
app.use("/api/order", orderRouter);

// Serve images statically
app.use('/images', express.static('uploads'));
app.use('/api/location', locationRoutes);
app.use("/api/deliveryboys", deliveryBoyRoutes); // ✅ Mount the delivery boy routes

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
//mongodb+srv://shahnishita76:nishu*2003@cluster0.hjxo8yy.mongodb.net/?
