import React, { useContext, useState, useEffect } from 'react';
import './LoginPopup.css';
import { StoreContext } from '../../context/StoreContext';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const { url, setToken } = useContext(StoreContext);

  const [currState, setCurrState] = useState("Login");
  const [forgotStep, setForgotStep] = useState("email");
  const [showPassword, setShowPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    confirmNewPassword: "",
    otp: ""
  });

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onLogin = async (e) => {
    e.preventDefault();
    const endpoint = currState === "Login" ? "/api/user/login" : "/api/user/register";
    try {
      const response = await axios.post(url + endpoint, data);
      if (response.data.success) {
        setToken(response.data.token);
        sessionStorage.setItem("token", response.data.token);
        setShowLogin(false);
        alert(currState === "Sign Up" ? "Account created!" : "Login successful");
        navigate("/");
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      console.error("API error:", err);
      alert("Something went wrong. Check console.");
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!data.email) return alert("Please enter your email");

    try {
      const res = await axios.post(`${url}/api/user/send-otp`, { email: data.email });
      if (res.data.success) {
        alert("OTP sent to your email.");
        setForgotStep("verify");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Error sending OTP");
    }
  };

  const verifyOtpAndReset = async (e) => {
    e.preventDefault();
    if (data.newPassword !== data.confirmNewPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await axios.post(`${url}/api/user/verify-otp-reset`, {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword
      });

      if (res.data.success) {
        alert("Password reset successful. Please login.");
        setCurrState("Login");
        setForgotStep("email");
        setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "", otp: "" });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Reset error:", err);
      alert("Failed to reset password");
    }
  };

  const toggleAuthState = (newState) => {
    setCurrState(newState);
    setForgotStep("email");
    setData({ name: "", email: "", password: "", newPassword: "", confirmNewPassword: "", otp: "" });
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setToken(token);
      setShowLogin(false);
      navigate("/myorders");
    }
  }, [setToken, setShowLogin, navigate]);

  return (
    <div className='login-popup'>

      <form
        onSubmit={
          currState === "Forgot"
            ? (forgotStep === "email" ? sendOtp : verifyOtpAndReset)
            : onLogin
        }
        className="login-popup-container"
      >
        <div className="login-popup-title">
          <h2>
            {currState === "Forgot"
              ? (forgotStep === "email" ? "" : " ")
              : currState}
          </h2>
          <span className="close-btn" onClick={() => setShowLogin(false)}>×</span>
        </div>

        <div className="login-popup-inputs">
          {currState === "Sign Up" && (
            <input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />
          )}
          <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Enter Your Gmail' required />

          {(currState === "Login" || currState === "Sign Up") && (
            <div className="password-field">
              <input
                name='password'
                onChange={onChangeHandler}
                value={data.password}
                type={showPassword ? "text" : "password"}
                placeholder='Password'
                required
              />
              <span
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer", userSelect: "none", fontSize: "18px", marginLeft: "8px" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁' : '👁‍🗨'}
              </span>
            </div>
          )}

          {currState === "Forgot" && forgotStep === "verify" && (
            <>
              <input name='otp' onChange={onChangeHandler} value={data.otp} type="text" placeholder='Enter OTP' required />
              <input name='newPassword' onChange={onChangeHandler} value={data.newPassword} type="password" placeholder='New Password' required />
              <input name='confirmNewPassword' onChange={onChangeHandler} value={data.confirmNewPassword} type="password" placeholder='Confirm Password' required />
            </>
          )}
        </div>

        {currState !== "Forgot" && (
          <div className="login-popup-condition">
            <label>
              <input type="checkbox" required />
              By continuing, I agree to the terms of use & privacy policy
            </label>
          </div>
        )}

        <button type='submit'>
          {currState === "Login"
            ? "Login"
            : currState === "Sign Up"
              ? "Create account"
              : (forgotStep === "email" ? "Send OTP" : "Reset Password")}
        </button>

        {currState === "Login" && (
          <>
            <p>Forgot password? <span onClick={() => toggleAuthState("Forgot")} style={{cursor: 'pointer', color: 'blue'}}>Click here</span></p>
            <p>Create a new account? <span onClick={() => toggleAuthState("Sign Up")} style={{cursor: 'pointer', color: 'blue'}}>Click here</span></p>
          </>
        )}
        

        {currState === "Sign Up" && (
          <p>Already have an account? <span onClick={() => toggleAuthState("Login")} style={{cursor: 'pointer', color: 'blue'}}>Login here</span></p>
        )}
        

        {currState === "Forgot" && (
          <p>Remember your password? <span onClick={() => toggleAuthState("Login")} style={{cursor: 'pointer', color: 'blue'}}>Go back to login</span></p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;
