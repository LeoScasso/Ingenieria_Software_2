import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const EditCarForm = () => {
  const location = useLocation()
  const vehicleFromState = location.state?.vehicle
  const oldNumberPlate = vehicleFromState.number_plate

  const [branches, setBranches] = useState([])
  const [categories, setCategories] = useState([])
  const [carBrands, setCarBrands] = useState([])
  const [models, setModels] = useState([])

  // Filtrar sucursales activas (status 0) - excluir status 1 y 2
  const activeBranches = branches.filter((branch) => branch.branch_status === 0)

  const [formData, setFormData] = useState({
    vehicle_id: vehicleFromState?.vehicle_id || '',
    number_plate: vehicleFromState?.number_plate || '',
    old_number_plate: oldNumberPlate,
    category: vehicleFromState?.category || '',
    condition: vehicleFromState?.condition || '',
    model: vehicleFromState?.model || '',
    year: vehicleFromState?.year || '',
    brand: vehicleFromState?.brand || '',
    branch: vehicleFromState?.branch?.name || '', // Asegúrate de acceder al nombre de la sucursal
  })

  const estados = ['Disponible', 'Alquilado', 'Mantenimiento']

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiClient.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Error al obtener categorías:', error)
      }
    }

    const getBrands = async () => {
      try {
        const response = await apiClient.get('/get_brands')
        setCarBrands(response.data)
      } catch (error) {
        console.error('Error al obtener marcas:', error)
      }
    }

    const getBranches = async () => {
      try {
        const response = await apiClient.get('/get_branches')
        setBranches(response.data)

        // Si la sucursal no está establecida pero tenemos datos del vehículo
        if (vehicleFromState?.branch && !formData.branch) {
          setFormData((prev) => ({
            ...prev,
            branch: vehicleFromState.branch.name || '',
          }))
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
      }
    }

    getCategories()
    getBrands()
    getBranches()
  }, [])

  useEffect(() => {
    if (formData.brand) {
      fetchModelsByBrand(formData.brand)
    } else {
      setModels([])
    }
  }, [formData.brand])

  const fetchModelsByBrand = async (brand) => {
    try {
      const response = await apiClient.get('/get_models_by_brand', {
        params: { brand },
      })
      setModels(response.data)
    } catch (error) {
      console.error('Error al obtener modelos:', error)
      setModels([])
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChangeBrand = (e) => {
    const selectedBrand = e.target.value
    setFormData({ ...formData, brand: selectedBrand, model: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const selectedBranch = activeBranches.find(
        (b) => b.name === formData.branch
      )

      if (!selectedBranch) {
        alert('Sucursal no válida seleccionada.')
        return
      }

      const payload = {
        ...formData,
        branch: selectedBranch.branch_id, // Convertimos nombre a ID
      }

      const response = await apiClient.put('/update_vehicle', payload)
      alert(response.data.message)
    } catch (error) {
      if (error.response) {
        console.error('Error al actualizar:', error.response.data)
        alert('Error: ' + (error.response.data.message || 'Error del server'))
      } else if (error.request) {
        console.error('Sin respuesta del servidor:', error.request)
        alert('Error: No hubo respuesta del servidor.')
      } else {
        console.error('Error en solicitud:', error.message)
        alert('Error: ' + error.message)
      }
    }
  }

  const fields = [
    {
      name: 'number_plate',
      label: 'Patente',
      type: 'text',
      value: formData.number_plate,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-number_plate',
      autoFocus: true,
    },
    {
      name: 'brand',
      label: 'Marca',
      type: 'select',
      value: formData.brand,
      onChange: handleChangeBrand,
      required: true,
      autoComplete: 'edit-brand',
      options: carBrands.map((brand) => ({ value: brand, label: brand })),
    },
    {
      name: 'model',
      label: 'Modelo',
      type: 'select',
      value: formData.model,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-model',
      options:
        models.length > 0
          ? models.map((model) => ({ value: model, label: model }))
          : [{ value: '', label: 'Seleccione una marca' }],
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      value: formData.category,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-category',
      options: categories.map((name) => ({ value: name, label: name })),
    },
    {
      name: 'year',
      label: 'Año',
      type: 'number',
      value: formData.year,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-year',
    },
    {
      name: 'condition',
      label: 'Condición',
      type: 'select',
      value: formData.condition,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-condition',
      options: estados.map((estado) => ({ value: estado, label: estado })),
    },
    {
      name: 'branch',
      label: 'Sucursal',
      type: 'select',
      value: formData.branch,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-branch',
      options: activeBranches.map((branch) => ({
        value: branch.name,
        label: `${branch.name} - ${branch.address}`,
      })),
    },
  ]

  return (
    <Form
      title="Editar Vehículo"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Guardar Cambios"
    >
      <Typography
        variant="body2"
        color="white"
        sx={{ textAlign: 'center', mt: 2 }}
      >
        No deben quedar campos vacíos
      </Typography>
    </Form>
  )
}

export default EditCarForm
