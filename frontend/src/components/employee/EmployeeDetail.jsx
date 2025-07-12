import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
  Avatar,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLocation, useNavigate } from 'react-router-dom'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import BadgeIcon from '@mui/icons-material/Badge'
import BusinessIcon from '@mui/icons-material/Business'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockIcon from '@mui/icons-material/Lock'
import apiClient from '../../middleware/axios'

const EmployeeDetail = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { employee_id } = location.state || {}
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Traemos detalle (menos campos)
        const detailResp = await apiClient.post('/employee_detail', { employee_id })
        const detailData = detailResp.data

        // Traemos lista completa para tener todos los campos, incluyendo contraseña etc
        const listResp = await apiClient.get('/get_employees')
        const allEmployees = listResp.data

        // Buscamos empleado completo en lista
        const fullData = allEmployees.find(emp => emp.employee_id === employee_id)

        // Merge: priorizamos datos del detalle, y agregamos lo que falte del full
        const combinedData = { ...fullData, ...detailData }

        setEmployee(combinedData)
      } catch (error) {
        console.error('Error al obtener detalle completo del empleado:', error)
      } finally {
        setLoading(false)
      }
    }

    if (employee_id) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [employee_id])

  const renderField = (icon, label, value, isPassword = false) => {
    if (!value) return null

    return (
      <Box display="flex" alignItems="center" gap={2}>
        {icon}
        <Typography
          variant="body2"
          color={theme.palette.ming}
          fontWeight="bold"
          sx={{ minWidth: 80 }}
        >
          {label}:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            wordBreak: 'break-word',
            color: theme.palette.darkBlue,
            fontWeight: 'medium',
            fontFamily: isPassword ? 'monospace' : 'inherit',
            userSelect: 'all',
          }}
        >
          {value}
        </Typography>
      </Box>
    )
  }

  const getInitials = () => {
    const first = employee?.name || ''
    const last = employee?.last_name || ''
    return first && last
      ? `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
      : 'E'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: theme.palette.ming }} />
      </Box>
    )
  }

  if (!employee) {
    return (
      <Box p={3}>
        <Typography color="error">Empleado no encontrado</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: theme.palette.charcoal,
        minHeight: '100vh',
      }}
    >
      <Card
        elevation={8}
        sx={{
          maxWidth: 500,
          width: '100%',
          backgroundColor: theme.palette.beige,
          border: `3px solid ${theme.palette.ming}`,
          borderRadius: 4,
          position: 'relative',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              backgroundColor: theme.palette.ming,
              color: theme.palette.beige,
              '&:hover': {
                backgroundColor: theme.palette.darkBlue,
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
            title="Volver"
          >
            <ArrowBackIcon />
          </IconButton>

          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                mb: 2,
                backgroundColor: theme.palette.ming,
                color: theme.palette.beige,
                fontSize: '2rem',
                fontWeight: 'bold',
                border: `4px solid ${theme.palette.darkBlue}`,
              }}
            >
              {getInitials()}
            </Avatar>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              sx={{
                color: theme.palette.darkBlue,
                textAlign: 'center',
              }}
            >
              {employee.name} {employee.last_name}
            </Typography>
          </Box>

          <Divider
            sx={{
              mb: 3,
              backgroundColor: theme.palette.ming,
              height: 2,
            }}
          />

          <Stack spacing={3}>
            {renderField(<BadgeIcon sx={{ color: theme.palette.ming }} />, 'DNI', employee.dni)}
            {renderField(<EmailIcon sx={{ color: theme.palette.ming }} />, 'Email', employee.email)}
            {renderField(<PhoneIcon sx={{ color: theme.palette.ming }} />, 'Teléfono', employee.phone_number)}
            {renderField(<BusinessIcon sx={{ color: theme.palette.ming }} />, 'Sucursal', employee.branch_name)}

            {/* Agrego contraseña u otros campos que estén */}
            {renderField(<LockIcon sx={{ color: theme.palette.ming }} />, 'Contraseña', employee.password, true)}

            {/* Si hay otros campos: */}
            {renderField(null, 'Usuario', employee.username)}
            {renderField(null, 'Rol', employee.role)}
            {/* ... */}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default EmployeeDetail
