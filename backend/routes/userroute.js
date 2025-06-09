import express from 'express';
import {
  loginUser,
  registeruser,
  sendOTP,
  verifyOTPAndResetPassword
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registeruser);
userRouter.post('/login', loginUser);

// ✅ OTP Password Reset Routes
userRouter.post('/send-otp', sendOTP);                    // Step 1: Send OTP
userRouter.post('/verify-otp-reset', verifyOTPAndResetPassword); // Step 2: Verify OTP + reset password

export default userRouter;
