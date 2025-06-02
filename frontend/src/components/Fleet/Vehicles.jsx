import React, { useEffect, useState } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'

// Función para obtener el rol del usuario
const getUserRole = () => {
  return sessionStorage.getItem('role')
}

// Componente para las celdas del encabezado
const HeaderCell = ({ children }) => {
  return (
    <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
      {children}
    </TableCell>
  )
}

// Función para determinar color de política
const getPolicyColor = (policyName, theme) => {
  switch (policyName?.toLowerCase()) {
    case 'sin devolucion':
      return {
        backgroundColor: theme.palette.darkBlue,
        color: theme.palette.beige,
      }
    case '20% de devolucion':
      return {
        backgroundColor: `${theme.palette.ming}`,
        color: theme.palette.beige,
      }
    case '100% de devolucion':
      return {
        backgroundColor: `${theme.palette.charcoal}90`,
        color: 'white',
      }
    default:
      return {
        backgroundColor: 'white',
        color: 'black',
      }
  }
}

// Componente para las celdas del cuerpo
const BodyCell = ({ children }) => {
  const theme = useTheme()
  return (
    <TableCell
      sx={{
        color: theme.palette.charcoal,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      {children}
    </TableCell>
  )
}

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [userRole, setUserRole] = useState('guest')
  const navigate = useNavigate()
  const theme = useTheme()

  useEffect(() => {
    setUserRole(getUserRole())
  }, [])

  const getVehicles = async () => {
    try {
      const response = await apiClient.get('/get_vehicles')
      setVehicles(response.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  useEffect(() => {
    getVehicles()
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: 'fit-content',
          maxHeight: '70vh',
          overflow: 'auto',
          backgroundColor: theme.palette.beige,
          boxShadow: `0 4px 8px ${theme.palette.slateGray}40`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: theme.palette.charcoal,
              }}
            >
              <HeaderCell>Patente</HeaderCell>
              <HeaderCell>Marca</HeaderCell>
              <HeaderCell>Modelo</HeaderCell>
              <HeaderCell>Año</HeaderCell>
              <HeaderCell>Categoría</HeaderCell>
              <HeaderCell>Precio/Día</HeaderCell>
              <HeaderCell>Capacidad</HeaderCell>
              <HeaderCell>Días mín. alq.</HeaderCell>
              <HeaderCell>Política de cancelación</HeaderCell>
              <HeaderCell>Condición</HeaderCell>
              {userRole === 'admin' && <HeaderCell>Acciones</HeaderCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.number_plate}
                sx={{
                  backgroundColor: theme.palette.beige,
                  '&:hover': {
                    backgroundColor: `${theme.palette.beanBlue}30`,
                  },
                }}
              >
                <BodyCell>{vehicle.number_plate}</BodyCell>
                <BodyCell>{vehicle.brand}</BodyCell>
                <BodyCell>{vehicle.model}</BodyCell>
                <BodyCell>{vehicle.year}</BodyCell>
                <BodyCell>{vehicle.category}</BodyCell>
                <BodyCell>{vehicle.price_per_day}</BodyCell>
                <BodyCell>{vehicle.max_capacity}</BodyCell>
                <BodyCell>{vehicle.minimum_rental_days}</BodyCell>
                <BodyCell>
                  <Chip
                    label={vehicle.name}
                    sx={{
                      ...getPolicyColor(vehicle.name, theme),
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  />
                </BodyCell>
                <BodyCell>{vehicle.condition}</BodyCell>
                {userRole === 'admin' && (
                  <BodyCell>
                    <IconButton
                      onClick={() => {
                        navigate('/vehicles/edit', { state: { vehicle } })
                      }}
                      variant="contained"
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: theme.palette.slateGray,
                        color: theme.palette.beige,
                        '&:hover': {
                          backgroundColor: theme.palette.beanBlue,
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ marginRight: '5px' }}>
                        Editar
                      </Typography>
                      <EditIcon />
                    </IconButton>
                  </BodyCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
