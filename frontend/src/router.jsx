import { Box } from '@mui/material'
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AddPackages } from './components/AddPackages/AddPackages'
import { Vehicles } from './components/Fleet/Vehicles'
import Home from './components/Home/Home'
import Login from './components/auth/Login'
import { LoginAdmin } from './components/auth/LoginAdmin'
import BackgroundLogo from './components/bgLogo/bgLogo'
import { BranchesList } from './components/branches/BranchesList'
import CarForm from './components/carForm/CarForm'
import EditCarForm from './components/carForm/EditCarForm'
import Footer from './components/footer/footer'
import { Navbar } from './components/navbar/navbar'
import { CardPaymentForm, WalletPaymentForm } from './components/paymentForms'
import RegistrationForm from './components/registration/RegistrationForm'
import EmployeeRegForm from './components/registration/EmployeeRegForm'
import RentalRegistration from './components/rental/RentalRegistration'
import ReservationForm from './components/reservation/ReservationForm'
import { EditProfile } from './components/user/EditProfile'
import { Profile } from './components/user/Profile'
import RentalHistory from './components/user/RentalHistory'
import RentalHistoriEmp from './components/employee/RentalHistoryEmp'
import RentalToReturn from './components/employee/RentalToReturn'
import { theme } from './theme/theme'

const AppRouter = () => {
  return (
    <Router>
      <BackgroundLogo />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            backgroundColor: theme.palette.ming,
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/loginEmployee" element={<Login />} />
            <Route path="/loginAdmin" element={<LoginAdmin />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/vehicles/new" element={<CarForm />} />
            <Route path="/payment/card" element={<CardPaymentForm />} />
            <Route path="/payment/wallet" element={<WalletPaymentForm />} />
            <Route path="/reservation" element={<ReservationForm />} />
            <Route path="/mi-perfil" element={<Profile />} />
            <Route path="/editar-perfil" element={<EditProfile />} />
            <Route path="/historial-alquileres" element={<RentalHistory />} />
            <Route path="/vehicles/edit" element={<EditCarForm />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/rental-registration" element={<RentalRegistration />} />
            <Route path="/branches" element={<BranchesList />} />
            <Route path="/add-packages/:id" element={<AddPackages />} />
            <Route path="/employee-registration" element={<EmployeeRegForm />} />
            <Route path="/rental-history-emp" element={<RentalHistoriEmp />} />
            <Route path="/rental-to-return" element={<RentalToReturn />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  )
}

export default AppRouter
