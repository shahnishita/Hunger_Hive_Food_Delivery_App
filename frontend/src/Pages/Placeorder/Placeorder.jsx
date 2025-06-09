import React, { useContext, useState } from 'react';
import './Placeorder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { useEffect } from 'react';
const Placeorder = () => {
const { getTotalCartAmount, token, food_list, url, cartItems, deliveryFee, discount, calculateDeliveryFee } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    state: "",
    zip: "",
    country: "",
    phone: ""
  });

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);

  const subtotal = getTotalCartAmount();
  const totalAmount = subtotal + deliveryFee;

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    setLocError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });

        try {
          const response = await axios.get(`${url}/api/location/reverse`, {
            params: { lat: latitude, lon: longitude }
          });

          const address = response.data.address || {};
          const {
            house_number,
            road,
            suburb,
            neighbourhood,
            city,
            state,
            postcode,
            country
          } = address;

          const fallbackStreet = road || suburb || neighbourhood || city || '';
          const streetValue = `${house_number ? house_number + ' ' : ''}${fallbackStreet}`.trim();

          setData(prev => ({
            ...prev,
            street: streetValue,
            state: state || '',
            zip: postcode || '',
            country: country || ''
          }));
        } catch {
          setLocError("Failed to fetch address from location.");
        }

        setLocLoading(false);
      },
      () => {
        setLocError("Unable to retrieve your location.");
        setLocLoading(false);
      }
    );
  };

  const placeOrderHandler = async (e) => {
    e.preventDefault();

    if (subtotal === 0) {
      alert("Cart is empty!");
      return;
    }

    const address = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      street: data.street,
      state: data.state,
      zip: data.zip,
      country: data.country,
      phone: data.phone
    };

    const orderItems = food_list
      .filter(item => cartItems[item._id] > 0)
      .map(item => ({
        _id: item._id,
        name: item.name,
        price: item.price,
        quantity: cartItems[item._id]
      }));

    const orderData = {
      items: orderItems,
      amount: totalAmount,
      address,
      location,
      deliveryFee
    };

    try {
      const response = await axios.post(`${url}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.session_url) {
        window.location.href = response.data.session_url;
      } else {
        alert("Error placing order.");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order. Please try again.");
    }
  };
   useEffect(() => {
    if (location.latitude && location.longitude) {
      calculateDeliveryFee(location.latitude, location.longitude);
    }
  }, [location, calculateDeliveryFee]);

  return (
    <div>
      <form className='place-order' onSubmit={placeOrderHandler}>
        <div className='place-order-left'>
          <p className='title'>Delivery Information</p>
          <div className='multi-fields'>
            <input required type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First Name' />
            <input required type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last Name' />
          </div>
          <input required type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email Address' />
          <input required type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' />
          <input required type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' />
          <div className='multi-fields'>
            <input required type="text" name='zip' onChange={onChangeHandler} value={data.zip} placeholder='Zip Code' />
            <input required type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' />
          </div>
          <input required type="tel" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' />

          <div style={{ marginTop: '15px' }}>
            <button type="button" onClick={getCurrentLocation} disabled={locLoading}>
              {locLoading ? "Getting Location..." : "Use Current Location"}
            </button>
            {location.latitude && location.longitude && (
              <p>Location: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</p>
            )}
            {locError && <p style={{ color: 'red' }}>{locError}</p>}
          </div>
        </div>

        <div className='place-order-right'>
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{subtotal}</p>
            </div>
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{deliveryFee}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{totalAmount}</b>
            </div>
            <button type="submit" disabled={subtotal === 0}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Placeorder;
