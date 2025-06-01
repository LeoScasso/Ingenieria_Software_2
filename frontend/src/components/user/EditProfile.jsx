import { Save, Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'

export const EditProfile = () => {
  const [errors, setErrors] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userData, setUserData] = useState({
    name: '',
    last_name: '',
    dni: '',
    email: '',
    phone_number: '',
    password: '',
  })
  const theme = useTheme()
  const navigate = useNavigate()

  const handleInputChange = (field) => (event) => {
    setUserData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!userData.name) {
      newErrors.name = 'El nombre es requerido'
    }

    if (!userData.last_name) {
      newErrors.last_name = 'El apellido es requerido'
    }

    if (!userData.dni) {
      newErrors.dni = 'El DNI es requerido'
    } else {
      const dniString = String(userData.dni || '')
      if (!/^\d+$/.test(dniString)) {
        newErrors.dni = 'Formato de DNI inválido'
      }
    }

    if (!userData.email) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!userData.phone_number) {
      newErrors.phone_number = 'El teléfono es requerido'
    } else if (!/^[+]?[\d\s-()]+$/.test(userData.phone_number)) {
      newErrors.phone_number = 'Formato de teléfono inválido'
    }

    if (!userData.password) {
      newErrors.password = 'La contraseña es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await apiClient
          .put('/update_profile', userData)
          .then(() => {
            setShowSuccess(true)
            setTimeout(() => {
              navigate('/mi-perfil')
            }, 300)
          })
          .catch((error) => {
            console.error('Error al guardar:', error.response.data)
            alert(error.response.data.error)
          })
      } catch (error) {
        console.error('Error al guardar:', error)
      }
    }
  }

  // Obtener las iniciales del nombre completo
  const getInitials = () => {
    const firstName = userData.name || ''
    const lastName = userData.last_name || ''
    const initials =
      firstName && lastName
        ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
        : '--'
    return initials
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get('/my_profile')
        setUserData(response.data)
      } catch (error) {
        console.error('Error al obtener los datos del usuario:', error)
      }
    }
    fetchUserData()
  }, [])

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
              Editar Perfil
            </Typography>
          </Box>

          {showSuccess && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
                backgroundColor: theme.palette.ming,
                color: theme.palette.beige,
                '& .MuiAlert-icon': {
                  color: theme.palette.beige,
                },
              }}
            >
              ¡Datos guardados correctamente!
            </Alert>
          )}

          <Stack spacing={3}>
            <Box display="flex" gap={2}>
              <TextField
                label="Nombre"
                value={userData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="Nombre"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.beige,
                    '& fieldset': {
                      borderColor: theme.palette.ming,
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.darkBlue,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.darkBlue,
                    },
                    // Estilos para autofill
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                      WebkitTextFillColor: theme.palette.darkBlue,
                    },
                    '& input:-webkit-autofill:hover': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    },
                    '& input:-webkit-autofill:focus': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    },
                    '&:has(input:-webkit-autofill) fieldset': {
                      borderColor: '#666666 !important', // darkGray
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.ming,
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.darkBlue,
                  },
                }}
              />
              <TextField
                label="Apellido"
                value={userData.last_name}
                onChange={handleInputChange('last_name')}
                error={!!errors.last_name}
                helperText={errors.last_name}
                placeholder="Apellido"
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme.palette.beige,
                    '& fieldset': {
                      borderColor: theme.palette.ming,
                      borderWidth: 2,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.darkBlue,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.darkBlue,
                    },
                    // Estilos para autofill
                    '& input:-webkit-autofill': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                      WebkitTextFillColor: theme.palette.darkBlue,
                    },
                    '& input:-webkit-autofill:hover': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    },
                    '& input:-webkit-autofill:focus': {
                      WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    },
                    '&:has(input:-webkit-autofill) fieldset': {
                      borderColor: '#666666 !important', // darkGray
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.ming,
                    fontWeight: 'bold',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.darkBlue,
                  },
                }}
              />
            </Box>

            <TextField
              label="DNI"
              value={userData.dni}
              onChange={handleInputChange('dni')}
              error={!!errors.dni}
              helperText={errors.dni}
              placeholder="nº de DNI"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.beige,
                  '& fieldset': {
                    borderColor: theme.palette.ming,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  // Estilos para autofill
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    WebkitTextFillColor: theme.palette.darkBlue,
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '&:has(input:-webkit-autofill) fieldset': {
                    borderColor: '#666666 !important', // darkGray
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.ming,
                  fontWeight: 'bold',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.darkBlue,
                },
              }}
            />

            <TextField
              label="Email"
              type="email"
              value={userData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="Email de usuario"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.beige,
                  '& fieldset': {
                    borderColor: theme.palette.ming,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  // Estilos para autofill
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    WebkitTextFillColor: theme.palette.darkBlue,
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '&:has(input:-webkit-autofill) fieldset': {
                    borderColor: '#666666 !important', // darkGray
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.ming,
                  fontWeight: 'bold',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.darkBlue,
                },
              }}
            />

            <TextField
              label="Teléfono"
              value={userData.phone_number}
              onChange={handleInputChange('phone_number')}
              error={!!errors.phone_number}
              helperText={errors.phone_number}
              placeholder="número de teléfono"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.beige,
                  '& fieldset': {
                    borderColor: theme.palette.ming,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  // Estilos para autofill
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    WebkitTextFillColor: theme.palette.darkBlue,
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '&:has(input:-webkit-autofill) fieldset': {
                    borderColor: '#666666 !important', // darkGray
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.ming,
                  fontWeight: 'bold',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.darkBlue,
                },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={userData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              placeholder="Ingrese la contraseña"
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.beige,
                  '& fieldset': {
                    borderColor: theme.palette.ming,
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.darkBlue,
                  },
                  // Estilos para autofill
                  '& input:-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                    WebkitTextFillColor: theme.palette.darkBlue,
                  },
                  '& input:-webkit-autofill:hover': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '& input:-webkit-autofill:focus': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.beige} inset`,
                  },
                  '&:has(input:-webkit-autofill) fieldset': {
                    borderColor: '#666666 !important', // darkGray
                    borderWidth: 2,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.ming,
                  fontWeight: 'bold',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: theme.palette.darkBlue,
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end" sx={{ mr: 0.5 }}>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePassword}
                        edge="end"
                        sx={{ color: theme.palette.darkBlue }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 4, pb: 4 }}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{
              flex: 1,
              ml: 1,
              backgroundColor: theme.palette.ming,
              color: theme.palette.beige,
              '&:hover': {
                backgroundColor: theme.palette.darkBlue,
              },
            }}
          >
            Guardar
          </Button>
        </CardActions>
      </Card>
    </Box>
  )
}
