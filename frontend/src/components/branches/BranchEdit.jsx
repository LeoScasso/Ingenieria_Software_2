import { Business } from '@mui/icons-material'
import { Alert, Box, Typography, useTheme } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import CustomForm from '../common/Form'

export const BranchEdit = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { branchId } = useParams()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    locality: '',
  })
  const [originalData, setOriginalData] = useState({
    name: '',
    address: '',
    locality: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const [userRole, setUserRole] = useState('')

  // Función para verificar si hay cambios en el formulario
  const hasChanges = () => {
    return (
      formData.name !== originalData.name ||
      formData.address !== originalData.address ||
      formData.locality !== originalData.locality
    )
  }

  useEffect(() => {
    // Verificar el rol del usuario desde sessionStorage
    const role = sessionStorage.getItem('role')
    setUserRole(role)

    if (role !== 'admin') {
      setSubmitError('No tienes permisos para acceder a esta página')
      setInitialLoading(false)
      return
    }

    // Cargar los datos de la sucursal
    const fetchBranchData = async () => {
      try {
        const response = await apiClient.get(`/get_branch_detail/${branchId}`)
        const branchData = response.data

        const branchFormData = {
          name: branchData.name,
          address: branchData.address,
          locality: branchData.locality,
        }

        setFormData(branchFormData)
        setOriginalData(branchFormData) // Guardar los datos originales
        setSubmitError('')
      } catch (err) {
        console.error('Error al cargar datos de la sucursal:', err)
        if (err.response?.status === 403) {
          setSubmitError(
            'Acceso denegado. Solo los administradores pueden editar sucursales.'
          )
        } else if (err.response?.status === 404) {
          setSubmitError('Sucursal no encontrada.')
        } else {
          setSubmitError(
            'Error al cargar los datos de la sucursal. Por favor, inténtelo de nuevo.'
          )
        }
      } finally {
        setInitialLoading(false)
      }
    }

    fetchBranchData()
  }, [branchId])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la sucursal es requerido'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida'
    }

    if (!formData.locality.trim()) {
      newErrors.locality = 'La localidad es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }

    // Limpiar error general cuando el usuario modifique el formulario
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    // Verificar que haya cambios antes de enviar
    if (!hasChanges()) {
      setSubmitError('No se han realizado cambios en el formulario')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setSubmitError('')

    try {
      const editData = {
        branch_id: branchId,
        name: formData.name,
        address: formData.address,
        locality: formData.locality,
      }

      const response = await apiClient.put('/branch_edition', editData)

      if (response.status === 200) {
        // Redirigir al detalle de la sucursal con mensaje de éxito
        navigate(`/branches/${branchId}`, {
          state: {
            message: 'Sucursal editada exitosamente',
            severity: 'success',
          },
        })
      }
    } catch (error) {
      console.error('Error al editar sucursal:', error)

      if (error.response) {
        const { status, data } = error.response

        if (status === 401) {
          setSubmitError('Debe iniciar sesión para realizar esta acción')
        } else if (status === 403) {
          setSubmitError('Solo los administradores pueden editar sucursales')
        } else if (status === 400) {
          setSubmitError(data.message || 'Error en los datos enviados')
        } else {
          setSubmitError(
            'Error al editar la sucursal. Por favor, inténtelo de nuevo.'
          )
        }
      } else {
        setSubmitError(
          'Error de conexión. Por favor, verifique su conexión a internet.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate(`/branches/${branchId}`)
  }

  // Si está cargando inicialmente
  if (initialLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        sx={{ backgroundColor: theme.palette.ming }}
      >
        <Typography variant="h6" sx={{ color: theme.palette.beige }}>
          Cargando datos de la sucursal...
        </Typography>
      </Box>
    )
  }

  // Si el usuario no es administrador, mostrar mensaje de error
  if (userRole && userRole !== 'admin') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
        px={2}
        sx={{ backgroundColor: theme.palette.ming }}
      >
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          {submitError}
        </Alert>
      </Box>
    )
  }

  // Configurar los campos del formulario
  const fields = [
    {
      name: 'name',
      label: 'Nombre de la Sucursal',
      type: 'text',
      value: formData.name,
      onChange: handleInputChange('name'),
      error: !!errors.name,
      helperText: errors.name,
      required: true,
      disabled: loading,
      autoComplete: 'off',
    },
    {
      name: 'address',
      label: 'Dirección',
      type: 'textarea',
      value: formData.address,
      onChange: handleInputChange('address'),
      error: !!errors.address,
      helperText: errors.address,
      required: true,
      disabled: loading,
      autoComplete: 'off',
      rows: 3,
    },
    {
      name: 'locality',
      label: 'Localidad',
      type: 'text',
      value: formData.locality,
      onChange: handleInputChange('locality'),
      error: !!errors.locality,
      helperText: errors.locality,
      required: true,
      disabled: loading,
      autoComplete: 'off',
    },
  ]

  return (
    <Box
      sx={{
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
        backgroundColor: theme.palette.ming,
        minHeight: '100vh',
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
        sx={{ color: theme.palette.beige }}
      >
        <Business
          sx={{
            color: theme.palette.beige,
            mr: 2,
            fontSize: '2.5rem',
          }}
        />
        <Typography
          variant="h3"
          component="h1"
          sx={{
            color: theme.palette.beige,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Editar Sucursal
        </Typography>
      </Box>

      {/* Mensaje de error general */}
      {submitError && (
        <Box display="flex" justifyContent="center" mb={3}>
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {submitError}
          </Alert>
        </Box>
      )}

      {/* Formulario usando el componente genérico */}
      <CustomForm
        title=""
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText={loading ? 'Guardando...' : 'Guardar Cambios'}
        submitButtonDisabled={loading || !hasChanges()}
        formStyles={{
          backgroundColor: 'transparent',
        }}
        paperStyles={{
          backgroundColor: theme.palette.slateGray,
          border: `3px solid ${theme.palette.ming}`,
          borderRadius: 3,
          maxWidth: 800,
        }}
      >
        <Box display="flex" justifyContent="center" gap={2} mt={2}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: theme.palette.darkBlue,
              border: `2px solid ${theme.palette.darkBlue}`,
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.borderColor = theme.palette.ming
                e.target.style.color = theme.palette.ming
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.borderColor = theme.palette.darkBlue
                e.target.style.color = theme.palette.darkBlue
              }
            }}
          >
            Cancelar
          </button>
        </Box>
      </CustomForm>
    </Box>
  )
}
