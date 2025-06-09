import React from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar-options">
      <NavLink to="/add" className="sidebar-option">
        <img src={assets.add_icon} alt="Add Icon" />
        <p>Add Items</p>
      </NavLink>

      <NavLink to="/list" className="sidebar-option">
        <img src={assets.order_icon} alt="List Icon" />
        <p>List Items</p>
      </NavLink>

      <NavLink to="/orders" className="sidebar-option">
        <img src={assets.add_icon} alt="Orders Icon" />
        <p>Orders</p>
      </NavLink>

      {/* New Delivery Boys Option */}
      <NavLink to="/delivery-boys" className="sidebar-option">
        <img src={assets.delivery_boy_icon} alt="Delivery Boys Icon" />
        <p>Delivery Boys</p>
      </NavLink>
    </div>
  );
};

export default Sidebar;
