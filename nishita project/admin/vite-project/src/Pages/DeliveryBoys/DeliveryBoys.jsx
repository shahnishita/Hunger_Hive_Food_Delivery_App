import React, { useEffect, useState } from "react";
import "./DeliveryBoys.css";
import axios from "axios";

const DeliveryBoys = () => {
  const [deliveryBoys, setDeliveryBoys] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    instructions: "",
  });

  const token = sessionStorage.getItem("token");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit form to backend
  const handleAddDeliveryBoy = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      alert("Name and Phone are required");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/deliveryboys",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setDeliveryBoys((prev) => [...prev, response.data.data]);
        setFormData({
          name: "",
          phone: "",
          address: "",
          instructions: "",
        });
      }
    } catch (error) {
      console.error("Error adding delivery boy:", error);
      alert("Failed to add delivery boy");
    }
  };

  // Fetch all delivery boys
  const fetchDeliveryBoys = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/deliveryboys", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeliveryBoys(response.data.data || []);
    } catch (error) {
      console.error("Error fetching delivery boys:", error);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys();
  }, []);

  return (
    <div className="delivery-boys-container">
      <h2>Add Delivery Boy</h2>

      <form className="delivery-boy-form" onSubmit={handleAddDeliveryBoy}>
        <label>
          Name*:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            required
          />
        </label>

        <label>
          Phone*:
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            required
          />
        </label>

        <label>
          Address:
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter address"
          />
        </label>

        <label>
          Instructions:
          <input
            type="text"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            placeholder="Special instructions"
          />
        </label>

        <button type="submit">Add Delivery Boy</button>
      </form>

      <h2>Delivery Boys List</h2>
      {deliveryBoys.length === 0 ? (
        <p>No delivery boys added yet.</p>
      ) : (
        deliveryBoys.map((boy) => (
          <div key={boy._id} className="delivery-boy-card">
            <h3>{boy.name}</h3>
            <p><strong>Phone:</strong> {boy.phone}</p>
            <p><strong>Address:</strong> {boy.address || "N/A"}</p>
            <p><strong>Instructions:</strong> {boy.instructions || "None"}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default DeliveryBoys;
