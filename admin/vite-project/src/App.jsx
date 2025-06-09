import React from 'react';
import Navbar from './componets/Navbar/Navbar';
import Sidebar from './componets/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Add from './Pages/Add/Add';
import List from './Pages/List/List';
import './App.css'; // Import the CSS file for styling
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Order from './Pages/Order/Order';
import DeliveryBoys from './Pages/DeliveryBoys/DeliveryBoys';
const App = () => {
  const url ="http://localhost:4000"
  return (
    <div>
      <ToastContainer/>
      <Navbar />
      <hr />
      <div className="app-content">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Add url={url}/>} />
            <Route path="/add" element={<Add url={url}/>} /> {/* ✅ Added this line */}
            <Route path="/list" element={<List url={url} />} />
            <Route path="/orders" element={<Order url={url}/>} />
            <Route path="/delivery-boys" element={<DeliveryBoys url={url}/>}/>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
