import React, { useEffect, useState } from 'react';
import './Order.css';
import { toast } from 'react-toastify';
import axios from 'axios';

const Order = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const token = sessionStorage.getItem("token");

  // Fetch all orders
  const fetchAllOrders = async () => {
    try {
      console.log("Fetching all orders...");
      const response = await axios.get(url + "/api/order/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Orders response:", response);
      if (response.data.success) {
        setOrders(response.data.data);
        console.log("Orders set successfully");
      } else {
        toast.error("Failed to fetch orders");
        console.error("Orders fetch failed:", response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.response) {
        console.error("Orders fetch error response data:", error.response.data);
      }
      toast.error("Something went wrong while fetching orders");
    }
  };

  const fetchDeliveryBoys = async () => {
  try {
    console.log("Fetching delivery boys from:", url + "/api/deliveryboys");

    const response = await axios.get(url + "/api/deliveryboys", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Delivery boys response:", response);

    // ✅ YOUR BACKEND RETURNS: { data: [...] }
    if (Array.isArray(response.data.data)) {
      setDeliveryBoys(response.data.data);
      console.log("✅ Delivery boys set successfully");
    } else {
      toast.error("Failed to fetch delivery boys - unexpected response format");
      console.error("Delivery boys fetch failed:", response.data);
    }
  } catch (error) {
    console.error("❌ Error fetching delivery boys:", error);
    toast.error("Something went wrong while fetching delivery boys");
  }
};


  // Assign delivery boy to an order
  const assignDeliveryBoy = async (orderId, deliveryBoyId) => {
    try {
      console.log(`Assigning delivery boy ${deliveryBoyId} to order ${orderId}`);
      const response = await axios.put(
        url + "/api/order/assign-deliveryboy",
        { orderId, deliveryBoyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Assign delivery boy response:", response);
      if (response.data.success) {
        toast.success("Delivery boy assigned");
        fetchAllOrders(); // Refresh orders to see updated assignment
      } else {
        toast.error("Failed to assign delivery boy");
        console.error("Assign delivery boy failed:", response.data);
      }
    } catch (error) {
      console.error("Error assigning delivery boy:", error);
      if (error.response) {
        console.error("Assign delivery boy error response data:", error.response.data);
      }
      toast.error("Something went wrong");
    }
  };

  // Status change handler
  const statushandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      console.log(`Updating status of order ${orderId} to ${newStatus}`);
      const response = await axios.post(
        url + "/api/order/status",
        {
          orderId,
          status: newStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Status update response:", response);
      if (response.data.success) {
        toast.success("Order status updated");
        fetchAllOrders();
      } else {
        toast.error("Failed to update status");
        console.error("Status update failed:", response.data);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      if (error.response) {
        console.error("Status update error response data:", error.response.data);
      }
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchAllOrders();
    fetchDeliveryBoys();
  }, []);

  return (
    <div className="order add">
      <h3>Order Page</h3>
      <div className="order-list">
        {orders.map((order, index) => {
          const totalQuantity =
            order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

          return (
            <div key={index} className="order-item">
              <p className="order-item-food">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <span key={i}>
                      {item.name} × {item.quantity}
                      {i < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  <span>No items in this order</span>
                )}
              </p>

              <p className="order-item-total">Total Items: {totalQuantity}</p>
              <p>₹{order.amount}</p>

              <select
                onChange={(event) => statushandler(event, order._id)}
                value={order.status}
              >
                <option value="Food Processing">Food Processing</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>

              <label>
                Assign Delivery Boy:
                <select
                  value={order.assignedDeliveryBoy?._id || ""}
                  onChange={(e) =>
                    assignDeliveryBoy(order._id, e.target.value)
                  }
                >
                  <option value="">-- Select Delivery Boy --</option>
                  {deliveryBoys.map((boy) => (
                    <option key={boy._id} value={boy._id}>
                      {boy.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Order;
