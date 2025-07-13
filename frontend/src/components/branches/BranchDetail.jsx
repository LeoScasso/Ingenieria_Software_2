import {
  ArrowBack,
  Business,
  Delete,
  DirectionsCar,
  Edit,
  Email,
  LocalShipping,
  LocationOn,
  People,
  Person,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../middleware/axios'

export const BranchDetail = () => {
  const theme = useTheme()
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [branchDetail, setBranchDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchBranchDetail = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/get_branch_detail/${branchId}`)
        setBranchDetail(response.data)
        setError(null)
      } catch (err) {
        console.error('Error al cargar detalle de sucursal:', err)
        if (err.response?.status === 403) {
          setError(
            'Acceso denegado. Solo los administradores pueden ver este detalle.'
          )
        } else if (err.response?.status === 404) {
          setError('Sucursal no encontrada.')
        } else {
          setError(
            'Error al cargar el detalle de la sucursal. Por favor, inténtelo de nuevo.'
          )
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBranchDetail()
  }, [branchId])

  const handleBack = () => {
    navigate('/branches')
  }

  const handleEdit = () => {
    navigate(`/branches/edit/${branchId}`)
  }

  const handleDelete = () => {
    setDeleteDialogOpen(true)
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      const response = await apiClient.delete('/logical_branch_deletion', {
        data: { branch_id: parseInt(branchId) },
      })

      if (response.status === 200) {
        // Cerrar el modal y redirigir al listado de sucursales
        setDeleteDialogOpen(false)
        navigate('/branches', {
          state: {
            message: response.data.message || 'Sucursal eliminada exitosamente',
            severity: 'success',
          },
        })
      }
    } catch (err) {
      console.error('Error al eliminar sucursal:', err)
      let errorMessage =
        'Error al eliminar la sucursal. Por favor, inténtelo de nuevo.'

      if (err.response?.status === 401) {
        errorMessage = 'Debe iniciar sesión para realizar esta acción.'
      } else if (err.response?.status === 403) {
        errorMessage = 'Solo los administradores pueden eliminar sucursales.'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }

      // Mostrar error en el modal o como alerta
      alert(errorMessage)
    } finally {
      setDeleting(false)
    }
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
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        px={2}
        gap={2}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={handleBack}
          startIcon={<ArrowBack />}
          sx={{
            backgroundColor: theme.palette.darkBlue,
            '&:hover': {
              backgroundColor: theme.palette.ming,
            },
          }}
        >
          Volver a Sucursales
        </Button>
      </Box>
    )
  }

  if (!branchDetail) {
    return null
  }

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: theme.palette.ming,
      }}
    >
      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle
          id="delete-dialog-title"
          sx={{ color: theme.palette.darkBlue }}
        >
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            ¿Está seguro que desea eliminar la sucursal "{branchDetail?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            disabled={deleting}
            sx={{ color: theme.palette.charcoal }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            disabled={deleting}
            variant="contained"
            sx={{
              backgroundColor: 'brown',
              '&:hover': {
                backgroundColor: 'DarkRed',
              },
              '&:disabled': {
                backgroundColor: 'gray',
              },
            }}
            startIcon={
              deleting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Delete />
              )
            }
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Información principal de la sucursal */}
        <Card
          elevation={8}
          sx={{
            backgroundColor: theme.palette.beige,
            border: `3px solid ${theme.palette.ming}`,
            borderRadius: 3,
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={3}
            >
              <Box display="flex" alignItems="center">
                <Business
                  sx={{
                    color: theme.palette.ming,
                    mr: 2,
                    fontSize: '3rem',
                  }}
                />
                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      color: theme.palette.darkBlue,
                      fontWeight: 'bold',
                      mb: 1,
                    }}
                  >
                    {branchDetail.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      icon={<People />}
                      label={`${branchDetail.employee_count} empleado${
                        branchDetail.employee_count === 1 ? '' : 's'
                      }`}
                      sx={{
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
                      label={`${branchDetail.fleet_size} vehículo${
                        branchDetail.fleet_size === 1 ? '' : 's'
                      }`}
                      sx={{
                        backgroundColor: theme.palette.charcoal,
                        color: theme.palette.beige,
                        fontWeight: 'bold',
                        '& .MuiChip-icon': {
                          color: theme.palette.beige,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ mb: 7, gap: 1 }}
              >
                <Tooltip title="Editar sucursal">
                  <IconButton
                    onClick={handleEdit}
                    sx={{
                      backgroundColor: theme.palette.beanBlue,
                      color: theme.palette.beige,
                      '&:hover': {
                        backgroundColor: theme.palette.darkBlue,
                      },
                      borderRadius: '50%',
                      boxShadow: 2,
                      width: '2.5rem',
                      height: '2.5rem',
                    }}
                    size="medium"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Dar de baja sucursal">
                  <IconButton
                    onClick={handleDelete}
                    sx={{
                      backgroundColor: 'brown',
                      color: theme.palette.beige,
                      '&:hover': {
                        backgroundColor: 'DarkRed',
                      },
                      borderRadius: '50%',
                      boxShadow: 2,
                      width: '2.5rem',
                      height: '2.5rem',
                    }}
                    size="medium"
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={3}>
              <LocationOn
                sx={{
                  color: theme.palette.ming,
                  mr: 2,
                  mt: 0.5,
                  fontSize: '1.5rem',
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.darkBlue,
                    fontWeight: 'medium',
                    mb: 1,
                  }}
                >
                  {branchDetail.address}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.charcoal,
                    fontStyle: 'italic',
                  }}
                >
                  {branchDetail.locality}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        {/* Lista de Empleados */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={4}
            sx={{
              backgroundColor: theme.palette.beige,
              border: `2px solid ${theme.palette.beanBlue}`,
              borderRadius: 2,
              width: 'fit-content',
              minWidth: '300px',
            }}
          >
            <Box
              sx={{
                p: 3,
                backgroundColor: theme.palette.beanBlue,
                color: theme.palette.beige,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                Empleados
              </Typography>
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              {branchDetail.employees.length > 0 ? (
                <List
                  sx={{
                    maxHeight: '18rem',
                    overflow: 'auto',
                    px: 2,
                    width: '100%',
                  }}
                >
                  {branchDetail.employees.map((employee) => (
                    <ListItem
                      key={employee.employee_id}
                      sx={{
                        border: `1px solid ${theme.palette.beanBlue}`,
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        width: 'fit-content',
                        minWidth: '250px',
                        mx: 'auto',
                      }}
                    >
                      <ListItemIcon>
                        <Person sx={{ color: theme.palette.beanBlue }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 'bold',
                              color: theme.palette.darkBlue,
                            }}
                          >
                            {employee.name} {employee.last_name}
                          </Typography>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Email
                              sx={{
                                fontSize: '1rem',
                                color: theme.palette.charcoal,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {employee.email}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    color: theme.palette.charcoal,
                    fontStyle: 'italic',
                    py: 3,
                  }}
                >
                  No hay empleados registrados en esta sucursal.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Lista de Vehículos */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={4}
            sx={{
              backgroundColor: theme.palette.beige,
              border: `2px solid ${theme.palette.charcoal}`,
              borderRadius: 2,
              width: 'fit-content',
              minWidth: '300px',
            }}
          >
            <Box
              sx={{
                p: 3,
                backgroundColor: theme.palette.charcoal,
                color: theme.palette.beige,
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                <DirectionsCar sx={{ mr: 1, verticalAlign: 'middle' }} />
                Vehículos
              </Typography>
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              {branchDetail.vehicles.length > 0 ? (
                <Box
                  sx={{ maxHeight: '18rem', overflow: 'auto', width: '100%' }}
                >
                  <List sx={{ px: 2, width: '100%' }}>
                    {branchDetail.vehicles.map((vehicle) => (
                      <ListItem
                        key={vehicle.number_plate}
                        sx={{
                          border: `1px solid ${theme.palette.charcoal}`,
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          width: 'fit-content',
                          minWidth: '250px',
                          mx: 'auto',
                        }}
                      >
                        <ListItemIcon>
                          <LocalShipping
                            sx={{ color: theme.palette.charcoal }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 'bold',
                                color: theme.palette.darkBlue,
                              }}
                            >
                              {vehicle.number_plate}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Categoría:</strong>{' '}
                                {vehicle.category_name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Condición:</strong>{' '}
                                {vehicle.condition_name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    color: theme.palette.charcoal,
                    fontStyle: 'italic',
                    py: 3,
                  }}
                >
                  No hay vehículos registrados en esta sucursal.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
