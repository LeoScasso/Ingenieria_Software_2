import { Box } from '@mui/material'
import React from 'react'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AddPackages } from './components/AddPackages/AddPackages'
import Login from './components/auth/Login'
import { LoginAdmin } from './components/auth/LoginAdmin'
import BackgroundLogo from './components/bgLogo/bgLogo'
import { BranchDetail } from './components/branches/BranchDetail'
import { BranchEdit } from './components/branches/BranchEdit'
import { BranchesList } from './components/branches/BranchesList'
import { BranchRegistration } from './components/branches/BranchRegistration'
import CarForm from './components/carForm/CarForm'
import EditCarForm from './components/carForm/EditCarForm'
import EmployeeDetail from './components/employee/EmployeeDetail'
import EmployeeEdit from './components/employee/EmployeeEdit'
import { EmployeesList } from './components/employee/EmployeesList'
import { EmployeeMaintenanceVehicles } from './components/Fleet/MaintenanceVehicles'
import { Vehicles } from './components/Fleet/Vehicles'
import Footer from './components/footer/footer'
import Home from './components/Home/Home'
import IncomeChart from './components/metrics/IncomeChart'
import RegisteredUsersChart from './components/metrics/RegisteredUsersChart'
import RentedVehiclesChart from './components/metrics/RentedCategoriesChart'
import { Navbar } from './components/navbar/navbar'
import { CardPaymentForm, WalletPaymentForm } from './components/paymentForms'
import EmployeeRegForm from './components/registration/EmployeeRegForm'
import RegistrationForm from './components/registration/RegistrationForm'
import RentalHistoriEmp from './components/rental/RentalHistoryEmp'
import RentalRegistration from './components/rental/RentalRegistration'
import RentalToReturn from './components/rental/RentalToReturn'
import ReservationDetail from './components/reservation/ReservationDetail'
import ReservationForm from './components/reservation/ReservationForm'
import UserActiveReservations from './components/reservation/UserActiveReservations'
import { EditProfile } from './components/user/EditProfile'
import { Profile } from './components/user/Profile'
import RentalHistory from './components/user/RentalHistory'
import LoginEmp from './components/auth/LoginEmp'
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
            <Route path="/loginEmployee" element={<LoginEmp />} />
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
            <Route
              path="/rental-registration"
              element={<RentalRegistration />}
            />
            <Route path="/branches" element={<BranchesList />} />
            <Route path="/branches/new" element={<BranchRegistration />} />
            <Route path="/branches/:branchId" element={<BranchDetail />} />
            <Route path="/branches/edit/:branchId" element={<BranchEdit />} />
            <Route path="/add-packages/:id" element={<AddPackages />} />
            <Route
              path="/employee-registration"
              element={<EmployeeRegForm />}
            />
            <Route path="/rental-history-emp" element={<RentalHistoriEmp />} />
            <Route path="/rental-to-return" element={<RentalToReturn />} />
            <Route path="/reserve-detail" element={<ReservationDetail />} />
            <Route path="/employees" element={<EmployeesList />} />
            <Route path="/employees/detail" element={<EmployeeDetail />} />
            <Route path="/employees/edit" element={<EmployeeEdit />} />
            <Route
              path="/user-reservations"
              element={<UserActiveReservations />}
            />
            <Route
              path="/maintenance-vehicles"
              element={<EmployeeMaintenanceVehicles />}
            />
            <Route
              path="/registered-users-metric"
              element={<RegisteredUsersChart />}
            />
            <Route path="/income-metric" element={<IncomeChart />} />
            <Route
              path="/rented-vehicles-metric"
              element={<RentedVehiclesChart />}
            />
            <Route
              path="/user-reservations"
              element={<UserActiveReservations />}
            />
            <Route
              path="/maintenance-vehicles"
              element={<EmployeeMaintenanceVehicles />}
            />
            <Route
              path="/registered-users-metric"
              element={<RegisteredUsersChart />}
            />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  )
}

export default AppRouter
