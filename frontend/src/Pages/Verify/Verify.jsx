import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import './Verify.css';
import { useSearchParams, useNavigate } from "react-router-dom";
import { StoreContext } from "../../context/StoreContext";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const { url, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your order...");

  const verifyPayment = async () => {
    try {
      const response = await axios.post(`${url}/api/order/verify`, {
        success,
        orderId,
      });
      if (response.data.success) {
        setMessage("Payment successful! Thank you for your order.");
        setCartItems({}); // Clear cart on success
        navigate("/myorders");
      } else {
        setMessage("Payment failed or cancelled.");
        navigate("/");
      }
    } catch (err) {
      console.error("Verification failed:", err);
      setMessage("An error occurred during verification.");
      navigate("/");
    }
  };

  useEffect(() => {
    if (success !== "true") {
      setMessage("Payment cancelled.");
      navigate("/");
    } else if (orderId) {
      verifyPayment();
    } else {
      setMessage("Missing order details.");
      navigate("/");
    }
  }, [success, orderId]);

  return (
    <div className="verify">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default Verify;
