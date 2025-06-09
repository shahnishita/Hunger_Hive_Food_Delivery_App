import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import { Routes, Route } from 'react-router-dom';
import Cart from './Pages/Cart/Cart';
import Home from './Pages/Home/Home';
import Placeorder from './Pages/Placeorder/Placeorder';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';
import Verify from './Pages/Verify/Verify';
import MyOrders from './Pages/MyOrders/MyOrders';
import LiveOrderTracking from './components/LiveOrderTracking/LiveOrderTracking';

const App = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<Placeorder />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/myorders' element={<MyOrders/>}/>
<Route path="/live-tracking/:orderId" element={<LiveOrderTracking />} />

        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
