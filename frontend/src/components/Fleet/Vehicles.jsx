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
  useTheme,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'

// Función para obtener el rol del usuario
const getUserRole = () => sessionStorage.getItem('role')

// Componente para las celdas del encabezado
const HeaderCell = ({ children }) => (
  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
    {children}
  </TableCell>
)

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
        backgroundColor: theme.palette.ming,
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

// ...importaciones...

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [userRole, setUserRole] = useState('guest')
  const [filterConditions, setFilterConditions] = useState([1, 2, 3])
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

  const handleConditionChange = (conditionId) => {
    setFilterConditions((prev) =>
      prev.includes(conditionId)
        ? prev.filter((id) => id !== conditionId)
        : [...prev, conditionId]
    )
  }

  const handleDelete = async (vehicle_id) => {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicle_id)

    if (!window.confirm('¿Estás seguro que querés eliminar este vehículo?')) return

    if (vehicle.condition_id === 2) {
      alert('No se puede eliminar un vehículo que está actualmente en alquiler.')
      return
    }

    try {
      await apiClient.delete('/delete_vehicle', { data: { vehicle_id } })
      alert('Vehículo eliminado con éxito')
      getVehicles()
    } catch (error) {
      console.error('Error al eliminar vehículo:', error)
      alert('No se pudo eliminar el vehículo')
    }
  }

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.condition_id !== 4 &&
      filterConditions.includes(vehicle.condition_id)
  )

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
      <FormGroup
        row
        sx={{
          mb: 2,
          gap: 2,
          backgroundColor: theme.palette.beige,
          borderRadius: 2,
          padding: 1,
          boxShadow: `inset 0 0 5px ${theme.palette.slateGray}50`,
        }}
      >
        {/* Checkboxes */}
        {[1, 2, 3].map((id) => (
          <FormControlLabel
            key={id}
            control={
              <Checkbox
                checked={filterConditions.includes(id)}
                onChange={() => handleConditionChange(id)}
                sx={{
                  color: theme.palette.charcoal,
                  '&.Mui-checked': {
                    color: theme.palette.beanBlue,
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontWeight: 'bold', color: theme.palette.charcoal }}>
                {{
                  1: 'Disponible',
                  2: 'Alquilado',
                  3: 'En Mantenimiento',
                }[id]}
              </Typography>
            }
          />
        ))}
      </FormGroup>

      {filteredVehicles.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            backgroundColor: theme.palette.beige,
            padding: 4,
            mt: 2,
            maxWidth: 600,
            textAlign: 'center',
            boxShadow: `0 4px 8px ${theme.palette.slateGray}40`,
          }}
        >
          <Typography
            sx={{
              color: theme.palette.charcoal,
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            No hay vehículos para mostrar con los filtros seleccionados.
          </Typography>
        </Paper>
      ) : (
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
              <TableRow sx={{ backgroundColor: theme.palette.charcoal }}>
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
              {filteredVehicles.map((vehicle) => (
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
                        onClick={() =>
                          navigate('/vehicles/edit', { state: { vehicle } })
                        }
                        sx={{
                          borderRadius: '10px',
                          backgroundColor: theme.palette.slateGray,
                          color: theme.palette.beige,
                          '&:hover': {
                            backgroundColor: theme.palette.beanBlue,
                          },
                          mr: 1,
                        }}
                        title="Editar vehículo"
                      >
                        <EditIcon />
                      </IconButton>

                      <IconButton
                        onClick={() => handleDelete(vehicle.vehicle_id)}
                        sx={{
                          borderRadius: '10px',
                          backgroundColor: theme.palette.error.main,
                          color: theme.palette.beige,
                          '&:hover': {
                            backgroundColor: theme.palette.error.dark,
                          },
                        }}
                        title="Eliminar vehículo"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </BodyCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
