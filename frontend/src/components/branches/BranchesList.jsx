import {
  Add as AddIcon,
  Business,
  DirectionsCar,
  LocationOn,
  People,
  Visibility,
  Warning,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Snackbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'

export const BranchesList = () => {
  const theme = useTheme()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const navigate = useNavigate()
  const location = useLocation()
  const role = sessionStorage.getItem('role')

  // Función para verificar si una sucursal está en proceso de eliminación
  const isBranchDeleting = (branch) => {
    return branch.branch_status === 1
  }

  // Función para obtener el texto del estado de eliminación
  const getDeletionStatusText = (branch) => {
    if (branch.branch_status === 1) {
      return 'En proceso de eliminación'
    }
    return ''
  }

  // Filtrar sucursales eliminadas (estado 2) del listado
  const activeBranches = branches.filter((branch) => branch.branch_status !== 2)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get('/get_branches')
        setBranches(response.data)
        setError(null)
      } catch (err) {
        console.error('Error al cargar sucursales:', err)
        setError(
          'Error al cargar las sucursales. Por favor, inténtelo de nuevo.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchBranches()
  }, [])

  // Mostrar mensaje de éxito si viene del formulario de registro
  useEffect(() => {
    if (location.state?.message) {
      setSnackbar({
        open: true,
        message: location.state.message,
        severity: location.state.severity || 'success',
      })
      // Limpiar el estado para evitar que se muestre el mensaje nuevamente
      navigate(location.pathname, { replace: true })
    }
  }, [location.state, navigate, location.pathname])

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} sx={{ color: theme.palette.beige }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        px={2}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: theme.palette.ming,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: theme.palette.beige,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Nuestras Sucursales
        </Typography>

        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/branches/new')}
            sx={{
              backgroundColor: theme.palette.darkBlue,
              color: theme.palette.beige,
              px: 3,
              py: 1.5,
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: theme.palette.ming,
              },
            }}
          >
            Agregar Sucursal
          </Button>
        )}
      </Box>
      <Grid container spacing={3} justifyContent="center">
        {activeBranches.map((branch) => (
          <Grid item xs={12} sm={6} md={4} key={branch.branch_id}>
            <Card
              elevation={8}
              sx={{
                height: '100%',
                backgroundColor: theme.palette.beige,
                border: `3px solid ${
                  isBranchDeleting(branch) ? 'red' : theme.palette.ming
                }`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                opacity: isBranchDeleting(branch) ? 0.7 : 1,
                '&:hover': {
                  transform: isBranchDeleting(branch)
                    ? 'none'
                    : 'translateY(-8px)',
                  boxShadow: isBranchDeleting(branch)
                    ? '0 4px 8px rgba(0,0,0,0.2)'
                    : '0 12px 24px rgba(0,0,0,0.3)',
                  borderColor: isBranchDeleting(branch)
                    ? 'red'
                    : theme.palette.darkBlue,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business
                    sx={{
                      color: isBranchDeleting(branch)
                        ? 'red'
                        : theme.palette.ming,
                      mr: 1,
                      fontSize: '2rem',
                    }}
                  />
                  <Box display="flex" alignItems="center" flex={1}>
                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{
                        color: isBranchDeleting(branch)
                          ? 'red'
                          : theme.palette.darkBlue,
                        fontWeight: 'bold',
                        flex: 1,
                        textDecoration: isBranchDeleting(branch)
                          ? 'line-through'
                          : 'none',
                      }}
                    >
                      {branch.name}
                    </Typography>
                    {isBranchDeleting(branch) && (
                      <Tooltip title={getDeletionStatusText(branch)}>
                        <Warning
                          sx={{
                            color: 'red',
                            ml: 1,
                            fontSize: '1.5rem',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Box>

                <Box display="flex" alignItems="flex-start" mb={2}>
                  <LocationOn
                    sx={{
                      color: theme.palette.ming,
                      mr: 1,
                      mt: 0.2,
                      fontSize: '1.2rem',
                    }}
                  />
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: theme.palette.darkBlue,
                        fontWeight: 'medium',
                        mb: 0.5,
                      }}
                    >
                      {branch.address}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.charcoal,
                        fontStyle: 'italic',
                      }}
                    >
                      {branch.locality}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mt={3}
                  gap={2}
                >
                  <Chip
                    icon={<People />}
                    label={`${branch.employee_count} empleado${
                      branch.employee_count === 1 ? '' : 's'
                    }`}
                    sx={{
                      padding: '0.5rem 1rem',
                      backgroundColor: theme.palette.beanBlue,
                      color: theme.palette.beige,
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: theme.palette.beige,
                      },
                    }}
                  />
                  <Chip
                    icon={<DirectionsCar />}
                    label={`${branch.fleet_size} vehículo${
                      branch.fleet_size === 1 ? '' : 's'
                    }`}
                    sx={{
                      padding: '0.5rem 1rem',
                      backgroundColor: theme.palette.charcoal,
                      color: theme.palette.beige,
                      fontWeight: 'bold',
                      '& .MuiChip-icon': {
                        color: theme.palette.beige,
                      },
                    }}
                  />
                </Box>
                {isBranchDeleting(branch) && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Chip
                      icon={<Warning />}
                      label={getDeletionStatusText(branch)}
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: 'white',
                        },
                      }}
                    />
                  </Box>
                )}
                {role === 'admin' && (
                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/branches/${branch.branch_id}`)
                      }}
                      sx={{
                        color: theme.palette.darkBlue,
                        borderColor: theme.palette.darkBlue,
                      }}
                    >
                      Ver detalle
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {activeBranches.length === 0 && !loading && !error && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="40vh"
        >
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.beanBlue,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            No hay sucursales disponibles en este momento.
          </Typography>
        </Box>
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
