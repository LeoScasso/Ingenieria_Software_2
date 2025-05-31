import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Home from './components/Home/Home' // Assuming Home component path
import Login from './components/auth/Login' // Assuming Login component path}
import { LoginAdmin } from './components/auth/LoginAdmin'
import BackgroundLogo from './components/bgLogo/bgLogo'
import Footer from './components/footer/footer'
import { Navbar } from './components/navbar/navbar'
import RegistrationForm from './components/registration/RegistrationForm' // Assuming RegistrationForm component path
import { Box } from '@mui/material'
import { theme } from './theme/theme'
import CarForm from './components/carForm/CarForm' 
import { CardPaymentForm, WalletPaymentForm } from './components/paymentForms'

const AppRouter = () => {
  return (
    <Router>
      <BackgroundLogo />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, width: '100%', backgroundColor: theme.palette.ming }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loginAdmin" element={<LoginAdmin />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/vehicles/new" element={<CarForm />} />
            <Route path="/payment/card" element={<CardPaymentForm />} />
            <Route path="/payment/wallet" element={<WalletPaymentForm />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  )
}

export default AppRouter
