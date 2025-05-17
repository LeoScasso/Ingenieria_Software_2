import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BackgroundLogo from './components/bgLogo/bgLogo';
import Navbar from './components/navbar/navbar';
import Home from './components/Home/Home'; // Assuming Home component path
import Login from './components/auth/Login'; // Assuming Login component path}
import Footer from './components/footer/footer';

const AppRouter = () => {
  return (
    <Router>
      <BackgroundLogo />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default AppRouter; 