import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './Cart.css';
import { useNavigate } from 'react-router';

const Cart = () => {
  const {
    cartItems = {},
    food_list = [],
    removeFromCart,
    getTotalCartAmount,
    extraCharges = 0,  // Added to receive dynamic extra charges
  } = useContext(StoreContext);

  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoStatus, setPromoStatus] = useState(null); // success | error | null
  const [usedPromoCodes, setUsedPromoCodes] = useState([]);

  const cartIsEmpty = Object.values(cartItems).every((qty) => qty <= 0);
  const subtotal = getTotalCartAmount();

  // Use dynamic extraCharges from context instead of fixed delivery
  const delivery = subtotal === 0 ? 0 : extraCharges;
  const total = subtotal + delivery - discount;

  const validPromoCodes = {
    SAVE10: 10,
    SAVE20: 20,
  };

  const applyPromoCode = () => {
    const code = promoInput.trim().toUpperCase();
    if (usedPromoCodes.includes(code)) {
      setPromoMessage('Promo code not available');
      setPromoStatus('error');
    } else if (validPromoCodes[code]) {
      setDiscount(validPromoCodes[code]);
      setPromoMessage('Promo code applied successfully!');
      setPromoStatus('success');
      setUsedPromoCodes([...usedPromoCodes, code]);
    } else {
      setPromoMessage('Invalid promo code');
      setPromoStatus('error');
    }
  };

  return (
    <div className='cart'>
      <div className='cart-items'>
        <div className='cart-items-title'>
          <p>Image</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />

        {!cartIsEmpty ? (
          food_list.map((item) => {
            const quantity = cartItems[item._id] || 0;
            if (quantity > 0) {
              return (
                <div key={item._id} className='cart-items-title cart-items-item'>
                  <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} />
                  <p>{item.name}</p>
                  <p>₹{item.price}</p>
                  <p>{quantity}</p>
                  <p>₹{item.price * quantity}</p>
                  <p className='remove-btn' onClick={() => removeFromCart(item._id)}>×</p>
                </div>
              );
            }
            return null;
          })
        ) : (
          <div className="empty-cart-message">
            <p>Your cart is empty.</p>
          </div>
        )}

        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹ {subtotal}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹ {delivery}</p>
            </div>
            {discount > 0 && (
              <>
                <hr />
                <div className="cart-total-details">
                  <p>Promo Discount</p>
                  <p className='green'>− ₹{discount}</p>
                </div>
              </>
            )}
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹ {total < 0 ? 0 : total}</b>
            </div>
            <button
              onClick={() => navigate('/order')}
              disabled={cartIsEmpty}
              className={cartIsEmpty ? 'disabled-btn' : ''}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>

          <div className="cart-promocode">
            <div>
              <p className='promocodep'>If you have a promo code, enter it here</p>
              <div className='cart-promocode-input'>
                <input
                  type="text"
                  placeholder='Promo Code'
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                />
                <button onClick={applyPromoCode}>Apply</button>
              </div>

              {promoStatus && (
                <div className={`promo-message ${promoStatus}`}>
                  {promoMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
