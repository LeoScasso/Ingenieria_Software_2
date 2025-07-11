import {
  Add as AddIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckIcon,
  Remove as RemoveIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  Switch,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../middleware/axios'

export const AddPackages = () => {
  const theme = useTheme()
  const { id: rentalId } = useParams()
  const navigate = useNavigate()

  const [packages, setPackages] = useState([])
  const [selectedPackages, setSelectedPackages] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const [addedPackagesSummary, setAddedPackagesSummary] = useState([])

  useEffect(() => {
    if (!rentalId) {
      setError('ID de alquiler no proporcionado')
      setLoading(false)
      return
    }
    fetchPackages()
  }, [rentalId])

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/get_packages')
      setPackages(response.data)
      setError(null)
    } catch (err) {
      console.error('Error al cargar paquetes:', err)
      setError('Error al cargar los paquetes disponibles')
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = (packageId, change) => {
    setSelectedPackages((prev) => {
      const currentQuantity = prev[packageId] || 0
      const newQuantity = Math.max(0, currentQuantity + change)

      if (newQuantity === 0) {
        const { [packageId]: removed, ...rest } = prev
        return rest
      }

      return {
        ...prev,
        [packageId]: newQuantity,
      }
    })
  }

  const handleQuantityInput = (packageId, value) => {
    const quantity = parseInt(value) || 0
    if (quantity === 0) {
      setSelectedPackages((prev) => {
        const { [packageId]: removed, ...rest } = prev
        return rest
      })
    } else {
      setSelectedPackages((prev) => ({
        ...prev,
        [packageId]: quantity,
      }))
    }
  }

  const getSelectedPackageInfo = (packageId) => {
    return packages.find((pkg) => pkg.package_id === packageId)
  }

  const calculateTotalPrice = () => {
    return Object.entries(selectedPackages).reduce(
      (total, [packageId, quantity]) => {
        const packageInfo = getSelectedPackageInfo(parseInt(packageId))
        return total + (packageInfo?.price * quantity || 0)
      },
      0
    )
  }

  const handleSubmit = async () => {
    if (Object.keys(selectedPackages).length === 0) {
      setSkipped(true)
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const selectedSummaries = Object.entries(selectedPackages).map(
        ([packageId]) => {
          const pkg = getSelectedPackageInfo(parseInt(packageId))
          return pkg?.name || 'Desconocido'
        }
      )

      setAddedPackagesSummary(selectedSummaries)

      const promises = Object.entries(selectedPackages).map(
        ([packageId, quantity]) =>
          apiClient.post('/add_package_to_rental', {
            rental_id: parseInt(rentalId),
            package_id: parseInt(packageId),
            quantity: quantity,
          })
      )

      await Promise.all(promises)
      setSuccess(true)
    } catch (err) {
      console.error('Error al agregar paquetes:', err)
      setError('Error al agregar los paquetes al alquiler')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(price)
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ color: theme.palette.beige }} />
      </Box>
    )
  }

  if (error && !loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" px={2}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (success) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        px={2}
        flexDirection="column"
        gap={2}
      >
        <Alert severity="success" sx={{ maxWidth: 600 }} icon={<CheckIcon />}>
          <Typography variant="h6" gutterBottom>
            ¡Paquetes agregados exitosamente!
          </Typography>
          {addedPackagesSummary.length > 0 && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                Se incorporaron al alquiler:
              </Typography>
              <ul style={{ margin: '8px 0 12px 16px', padding: 0 }}>
                {addedPackagesSummary.map((pkg, idx) => (
                  <li key={idx}>
                    <Typography variant="body2">{pkg}</Typography>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Button
            variant="contained"
            onClick={() => navigate('/rental-history-emp')}
            sx={{
              backgroundColor: theme.palette.beanBlue,
              color: theme.palette.beige,
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              '&:hover': { backgroundColor: theme.palette.charcoal },
            }}
          >
            Continuar
          </Button>
        </Alert>
      </Box>
    )
  }


  if (skipped) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" px={2}>
        <Alert severity="info" sx={{ maxWidth: 600 }} icon={<InfoIcon />}>
          <Typography variant="h6" gutterBottom>
            No se agregaron paquetes al alquiler
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4, px: 2 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: theme.palette.beige, fontWeight: 'bold', mb: 2 }}>
            Agregar Paquetes Adicionales
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.beige, opacity: 0.8 }}>
            Selecciona los paquetes que deseas agregar a tu alquiler
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Card sx={{ backgroundColor: theme.palette.beige, borderRadius: 3, boxShadow: 3, flex: '0 1 auto', minWidth: 450 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: 'black', fontWeight: 'bold', mb: 3 }}>
                Paquetes Disponibles
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {packages.map((pkg) => (
                  <Box key={pkg.package_id} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: theme.palette.beanBlue,
                    borderRadius: 2,
                    '&:hover': { backgroundColor: `${theme.palette.beanBlue}80` },
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ color: theme.palette.darkBlue, fontWeight: 'bold' }}>
                        {pkg.name}
                      </Typography>
                      <Typography variant="body1" sx={{ color: theme.palette.beige, fontWeight: 'bold' }}>
                        {formatPrice(pkg.price)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {pkg.name === 'Sillita de bebe' ? (
                        <>
                          <IconButton onClick={() => handleQuantityChange(pkg.package_id, -1)}
                            disabled={!selectedPackages[pkg.package_id]}
                            sx={{
                              backgroundColor: theme.palette.charcoal,
                              color: theme.palette.beige,
                              '&:hover': { backgroundColor: theme.palette.beanBlue },
                              '&:disabled': {
                                backgroundColor: theme.palette.slateGray,
                                color: theme.palette.beige,
                                opacity: 0.5,
                              },
                            }}>
                            <RemoveIcon />
                          </IconButton>

                          <TextField
                            type="number"
                            value={selectedPackages[pkg.package_id] || 0}
                            onChange={(e) => handleQuantityInput(pkg.package_id, e.target.value)}
                            sx={{
                              width: 80,
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: theme.palette.charcoal },
                                '&:hover fieldset': { borderColor: theme.palette.beanBlue },
                                '&.Mui-focused fieldset': { borderColor: theme.palette.beanBlue },
                              },
                              '& .MuiInputBase-input': {
                                color: theme.palette.darkBlue,
                                textAlign: 'center',
                                fontWeight: 'bold',
                              },
                            }}
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                          />

                          <IconButton onClick={() => handleQuantityChange(pkg.package_id, 1)}
                            sx={{
                              backgroundColor: theme.palette.charcoal,
                              color: theme.palette.beige,
                              '&:hover': { backgroundColor: theme.palette.beanBlue },
                            }}>
                            <AddIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Switch
                          checked={!!selectedPackages[pkg.package_id]}
                          onChange={(e) =>
                            handleQuantityInput(pkg.package_id, e.target.checked ? 1 : 0)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: theme.palette.beige,
                              '&:hover': { backgroundColor: `${theme.palette.ming}80` },
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: theme.palette.darkBlue,
                            },
                            '& .MuiSwitch-switchBase': {
                              color: theme.palette.charcoal,
                              '&:hover': { backgroundColor: `${theme.palette.charcoal}15` },
                            },
                            '& .MuiSwitch-track': {
                              backgroundColor: theme.palette.charcoal,
                            },
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card sx={{
            backgroundColor: theme.palette.beige,
            borderRadius: 3,
            boxShadow: 3,
            position: 'sticky',
            top: 20,
            flex: '0 1 auto',
            minWidth: 400,
            alignSelf: 'flex-start',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <CartIcon sx={{ color: theme.palette.darkBlue, mr: 1 }} />
                <Typography variant="h6" sx={{ color: theme.palette.darkBlue, fontWeight: 'bold' }}>
                  Resumen
                </Typography>
              </Box>

              {Object.keys(selectedPackages).length === 0 ? (
                <>
                  <Typography variant="body2" sx={{
                    color: theme.palette.slateGray,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    mb: 2,
                  }}>
                    No hay paquetes seleccionados
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleSubmit}
                    sx={{
                      borderColor: theme.palette.beanBlue,
                      color: theme.palette.beanBlue,
                      fontWeight: 'bold',
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: theme.palette.charcoal,
                        backgroundColor: `${theme.palette.beanBlue}10`,
                      },
                    }}>
                    Continuar sin paquetes
                  </Button>
                </>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    {Object.entries(selectedPackages).map(([packageId, quantity]) => {
                      const packageInfo = getSelectedPackageInfo(parseInt(packageId))
                      const isBooleanPackage = packageInfo?.name !== 'Sillita de bebe'
                      const displayQuantity = isBooleanPackage ? 1 : quantity

                      return (
                        <Box key={packageId} sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}>
                          <Box>
                            <Typography variant="body2" sx={{ color: theme.palette.darkBlue, fontWeight: 'bold' }}>
                              {packageInfo?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.slateGray }}>
                              {isBooleanPackage
                                ? 'Incluido'
                                : `${displayQuantity} x ${formatPrice(packageInfo?.price || 0)}`}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: theme.palette.beanBlue, fontWeight: 'bold' }}>
                            {formatPrice((packageInfo?.price || 0) * displayQuantity)}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}>
                    <Typography variant="h6" sx={{ color: theme.palette.darkBlue, fontWeight: 'bold' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.beanBlue, fontWeight: 'bold' }}>
                      {formatPrice(calculateTotalPrice())}
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{
                      backgroundColor: theme.palette.beanBlue,
                      color: theme.palette.beige,
                      fontWeight: 'bold',
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': { backgroundColor: theme.palette.charcoal },
                      '&:disabled': {
                        backgroundColor: theme.palette.slateGray,
                        color: theme.palette.beige,
                      },
                    }}>
                    {submitting ? (
                      <CircularProgress size={24} sx={{ color: theme.palette.beige }} />
                    ) : (
                      'Agregar Paquetes'
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}
