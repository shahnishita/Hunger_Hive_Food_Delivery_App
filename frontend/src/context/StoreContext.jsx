import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { food_list } from '../assets/assets';
// If current file is in src/components/Placeorder/Placeorder.jsx
import  getDistanceFromLatLonInKm  from '../components/LiveOrderTracking/LiveOrderTracking'
export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [tokenState, setTokenState] = useState(sessionStorage.getItem("token") !== "undefined" ? sessionStorage.getItem("token") : "");
  const [userEmail, setUserEmail] = useState(sessionStorage.getItem("userEmail") || null);
  const [cartItems, setCartItems] = useState({});
  const [discount, setDiscount] = useState(0);
  const [usedPromoCodes, setUsedPromoCodes] = useState([]);
  const [deliveryFee,setDeliveryFee] =useState(0) // static fee
const shopLocation = {
  latitude: 18.5123,  // replace with your shop's latitude
  longitude: 73.7701  // replace with your shop's longitude
};

  const url = "http://localhost:4000";

  const setToken = (newToken, email) => {
    setTokenState(newToken);
    setUserEmail(email);
    sessionStorage.setItem("token", newToken);
    sessionStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setTokenState(null);
    setUserEmail(null);
    setCartItems({});
    setDiscount(0);
    setUsedPromoCodes([]);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userEmail");
    if (userEmail) sessionStorage.removeItem(`cart_${userEmail}`);
  };

  useEffect(() => {
    if (tokenState && userEmail) {
      const savedCart = sessionStorage.getItem(`cart_${userEmail}`);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        setCartItems({});
      }
    } else {
      setCartItems({});
    }
  }, [tokenState, userEmail]);

  useEffect(() => {
    if (userEmail) {
      sessionStorage.setItem(`cart_${userEmail}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userEmail]);

  const calculateDeliveryFee  = (userLat, userLon) => {
  const distance = getDistanceFromLatLonInKm(userLat, userLon, shopLocation.latitude, shopLocation.longitude);
  console.log('Distance:', getDistanceFromLatLonInKm(userLat, userLon, shopLocation.latitude, shopLocation.longitude));

  if (distance > 4) {
    setDeliveryFee(100);  // Charge Rs. 100 if distance > 4 km
  } else {
    setDeliveryFee(50);    // No delivery fee if <= 4 km
  }
};


  const addToCart = async (itemId) => {
    const newQuantity = 1;

    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + newQuantity,
    }));

    if (tokenState) {
      try {
        await axios.post(`${url}/api/cart/add-to-cart`, { productId: itemId, quantity: newQuantity }, {
          headers: { Authorization: `Bearer ${tokenState}` },
        });
      } catch (error) {
        console.error("Error adding item to cart:", error);
        setCartItems((prev) => {
          const updated = { ...prev };
          if (updated[itemId] === 1) delete updated[itemId];
          else updated[itemId] -= 1;
          return updated;
        });
      }
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const updated = { ...prev };
      if (updated[itemId]) {
        updated[itemId] === 1 ? delete updated[itemId] : updated[itemId]--;
      }
      return updated;
    });

    if (tokenState) {
      axios.post(`${url}/api/cart/remove-from-cart`, { productId: itemId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${tokenState}` },
      }).catch((error) => console.error("Error removing item from cart:", error));
    }
  };

  const getCart = async (authToken) => {
    try {
      const response = await axios.post(`${url}/api/cart/get`, {}, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setCartItems(response.data.loadCartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  const clearCart = async () => {
    if (tokenState) {
      try {
        await axios.post(`${url}/api/cart/clear`, {}, {
          headers: tokenState ? { Authorization: `Bearer ${tokenState}` } : {},
        });
        setCartItems({});
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      setCartItems({});
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const loadCartData = async (authToken) => {
    try {
      const response = await axios.post(`${url}/api/cart/get`, {}, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      setCartItems(response.data.loadCartData || {});
    } catch (error) {
      console.error("Error loading cart data:", error);
    }
  };

  const applyPromoCode = (code) => {
    const upperCode = code.toUpperCase();
    const validPromoCodes = { SAVE10: 10, SAVE20: 20 };
    if (usedPromoCodes.includes(upperCode)) return { success: false, message: "Promo already used" };
    if (validPromoCodes[upperCode]) {
      setDiscount(validPromoCodes[upperCode]);
      setUsedPromoCodes([...usedPromoCodes, upperCode]);
      return { success: true, message: "Promo applied" };
    }
    return { success: false, message: "Invalid promo" };
  };

  const resetPromo = () => {
    setDiscount(0);
    setUsedPromoCodes([]);
  };

  useEffect(() => {
    async function loadData() {
      const storedToken = sessionStorage.getItem("token");
      const storedEmail = sessionStorage.getItem("userEmail");
      if (storedToken && storedToken !== "undefined" && storedEmail) {
        setToken(storedToken, storedEmail);
        await loadCartData(storedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    clearCart,
    getTotalCartAmount,
    url,
    token: tokenState,
    setToken,
    removeFromCart,
    userEmail,
    logout,
    getCart,
    discount,
    setDiscount,
    applyPromoCode,
    resetPromo,
    deliveryFee,
    calculateDeliveryFee,
  };
    return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );

};


export default StoreContextProvider;
