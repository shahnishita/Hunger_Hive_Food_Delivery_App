import React, { useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import parcel_icon from '../../assets/parcel_icon.png';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const MyOrders = () => {
  const { url } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = sessionStorage.getItem('token');
  let userId = null;

  if (token && token !== "undefined") {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (err) {
      console.error("Token decode error", err);
    }
  }

  const fetchOrders = async () => {
    if (!userId || !token) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/api/order/userorders`,
        { userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.data) {
        setData(response.data.data);
      } else {
        console.warn('Unexpected response:', response);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate subtotal for one order's items
  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // Calculate delivery fee dynamically
  const calculateDeliveryFee = (subtotal) => {
    return subtotal === 0 ? 0 : 2; // You can update fee logic here
  };

  const handleTrackClick = (order) => {
    navigate(`/live-tracking/${order._id}`, {
      state: {
        userAddress: order.address,
      },
    });
  };

  return (
    <div className="my-orders">
      <h2 className="myordersp">My Orders</h2>
      <div className="container">
        {loading && <p>Loading...</p>}
        {!loading && data.length === 0 && <p>No orders found.</p>}
        {!loading &&
          data.map((order, index) => {
            const subtotal = calculateSubtotal(order.items);
            const deliveryFee = calculateDeliveryFee(subtotal);
            const total = subtotal + deliveryFee;

            return (
              <div key={index} className="my-orders-order">
                <img
                  src={parcel_icon}
                  alt="Parcel Icon"
                  style={{ width: '50px', height: '50px' }}
                />
                <p>
                  {order.items.map((item, i) =>
                    i === order.items.length - 1
                      ? `${item.name} x ${item.quantity}`
                      : `${item.name} x ${item.quantity}, `
                  )}
                </p>
                <p>Subtotal: ₹ {subtotal.toFixed(2)}</p>
                <p>Delivery Fee: ₹ {deliveryFee.toFixed(2)}</p>
                <p><b>Total: ₹ {total.toFixed(2)}</b></p>
                <p>Items: {order.items.length}</p>
                <p>
                  <span>&#x25cf;</span> <b>{order.status}</b>
                </p>
                <button onClick={() => handleTrackClick(order)}>
                  Track Order
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default MyOrders;
