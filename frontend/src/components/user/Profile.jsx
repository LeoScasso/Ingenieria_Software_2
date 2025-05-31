import BusinessIcon from '@mui/icons-material/Business'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import apiClient from '../../middleware/axios'

export const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const theme = useTheme()

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await apiClient.get('/my_profile')
        console.log(response)
        setUser(response.data)
      } catch (error) {
        console.error('Error al obtener el perfil:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  // Función para renderizar cada campo con icono
  const renderInfoField = (icon, label, value) => {
    if (!value) return null

    return (
      <Box display="flex" alignItems="center" gap={2} key={label}>
        {icon}
        <Typography
          variant="body2"
          color={theme.palette.ming}
          fontWeight="bold"
          sx={{ minWidth: 80, textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            wordBreak: 'break-word',
            color: theme.palette.darkBlue,
            fontWeight: 'medium',
          }}
        >
          {value}
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress sx={{ color: theme.palette.ming }} />
      </Box>
    )
  }

  if (!user) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error al cargar los datos del perfil
        </Typography>
      </Box>
    )
  }

  // Obtener las iniciales del nombre completo
  const getInitials = () => {
    const firstName = user.name || ''
    const lastName = user.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        p: { xs: 2, sm: 3, md: 4 },
        backgroundColor: theme.palette.charcoal,
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
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header con Avatar y Nombre */}
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
                mb: 1,
              }}
            >
              {user.name && user.last_name
                ? `${user.name} ${user.last_name}`
                : user.name || 'Usuario'}
            </Typography>
            {user.branch_name && (
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.ming,
                  fontWeight: 'medium',
                  textAlign: 'center',
                }}
              >
                {user.branch_name}
              </Typography>
            )}
          </Box>

          <Divider
            sx={{
              mb: 3,
              backgroundColor: theme.palette.ming,
              height: 2,
            }}
          />

          {/* Campos de información */}
          <Stack spacing={3}>
            {renderInfoField(
              <PersonIcon
                sx={{ color: theme.palette.ming }}
                fontSize="medium"
              />,
              'DNI',
              user.dni
            )}

            {renderInfoField(
              <EmailIcon
                sx={{ color: theme.palette.ming }}
                fontSize="medium"
              />,
              'Email',
              user.email
            )}

            {renderInfoField(
              <PhoneIcon
                sx={{ color: theme.palette.ming }}
                fontSize="medium"
              />,
              'Teléfono',
              user.phone_number
            )}

            {user.branch_name &&
              renderInfoField(
                <BusinessIcon
                  sx={{ color: theme.palette.ming }}
                  fontSize="medium"
                />,
                'Sucursal',
                user.branch_name
              )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
