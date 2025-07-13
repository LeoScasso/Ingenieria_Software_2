import {
  Business,
  DirectionsCar,
  LocationOn,
  People,
  Visibility,
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
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'

export const BranchesList = () => {
  const theme = useTheme()
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const role = sessionStorage.getItem('role')

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
      <Typography
        variant="h3"
        component="h1"
        sx={{
          color: theme.palette.beige,
          textAlign: 'center',
          mb: 1,
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        Nuestras Sucursales
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {branches.map((branch) => (
          <Grid item xs={12} sm={6} md={4} key={branch.branch_id}>
            <Card
              elevation={8}
              sx={{
                height: '100%',
                backgroundColor: theme.palette.beige,
                border: `3px solid ${theme.palette.ming}`,
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                  borderColor: theme.palette.darkBlue,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Business
                    sx={{
                      color: theme.palette.ming,
                      mr: 1,
                      fontSize: '2rem',
                    }}
                  />
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      color: theme.palette.darkBlue,
                      fontWeight: 'bold',
                      flex: 1,
                    }}
                  >
                    {branch.name}
                  </Typography>
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

      {branches.length === 0 && !loading && !error && (
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
    </Box>
  )
}
