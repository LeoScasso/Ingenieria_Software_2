import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Home from './components/Home/Home' // Assuming Home component path
import Login from './components/auth/Login' // Assuming Login component path}
import BackgroundLogo from './components/bgLogo/bgLogo'
import Footer from './components/footer/footer'
import Navbar from './components/navbar/navbar'
import RegistrationForm from './components/registration/RegistrationForm' // Assuming RegistrationForm component path

const AppRouter = () => {
  return (
    <Router>
      <BackgroundLogo />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationForm />} />
      </Routes>
      <Footer />
    </Router>
  )
}

export default AppRouter
