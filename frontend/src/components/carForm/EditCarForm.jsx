import React, { useState, useEffect } from 'react'
import { Typography } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const EditCarForm = ({ vehicleId = 5 }) => {
  const [formData, setFormData] = useState({
    number_plate: '',
    category: '',
    condition: '',
    cancelation_policy: '',
    model: '',
    year: '',
    brand: ''
  })

  const [categories, setCategories] = useState([])

  const carBrands = ['Marca A', 'Marca B']

  const modelsByBrand = {
    'Marca A': ['Modelo A1', 'Modelo A2'],
    'Marca B': ['Modelo B1', 'Modelo B2']
  }

  const cancelationPolicies = [
    '100% de devolucion',
    '20% de devolucion',
    'Sin devolucion'
  ]

  const estados = [
    'Disponible',
    'Alquilado',
    'En mantenimiento'
  ]

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await apiClient.get('/get_vehicles')
        const vehicle = response.data.find(v => v.vehicle_id == vehicleId)
        if (vehicle) {
          setFormData({
            vehicle_id: vehicle.vehicle_id,
            number_plate: vehicle.number_plate,
            category: vehicle.category,
            condition: vehicle.condition,
            cancelation_policy: vehicle.policy,
            model: vehicle.model,
            year: vehicle.year,
            brand: vehicle.brand
          })
        } else {
          alert('Vehículo no encontrado')
        }
      } catch (error) {
        console.error('Error al obtener vehículo:', error)
      }
    }

    const getCategories = async () => {
      const response = await apiClient.get('/categories')
      setCategories(response.data)
    }

    fetchVehicle()
    getCategories()
  }, [vehicleId])

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChangeBrand = e => {
    setFormData({ ...formData, brand: e.target.value, model: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const response = await apiClient.put('/update_vehicle', formData)
      alert(response.data.message)
    } catch (error) {
      if (error.response) {
        console.error('Error al actualizar - respuesta del servidor:', error.response.data)
        alert('Error: ' + (error.response.data.message || 'Error del server'))
      } else if (error.request) {
        console.error('Error al actualizar - sin respuesta del servidor:', error.request)
        alert('Error: No hubo respuesta del servidor.')
      } else {
        console.error('Error en la solicitud de actualización:', error.message)
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
      autoFocus: true
    },
    {
      name: 'brand',
      label: 'Marca',
      type: 'select',
      value: formData.brand,
      onChange: handleChangeBrand,
      required: true,
      autoComplete: 'edit-brand',
      options: carBrands.map(brand => ({ value: brand, label: brand }))
    },
    {
      name: 'model',
      label: 'Modelo',
      type: 'select',
      value: formData.model,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-model',
      options: formData.brand
        ? modelsByBrand[formData.brand]?.map(model => ({ value: model, label: model })) || []
        : [{ value: '', label: 'Seleccione una marca primero' }]
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      value: formData.category,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-category',
      options: categories.map(name => ({ value: name, label: name }))
    },
    {
      name: 'year',
      label: 'Año',
      type: 'number',
      value: formData.year,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-year'
    },
    {
      name: 'condition',
      label: 'Condición',
      type: 'select',
      value: formData.condition,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-condition',
      options: estados.map(estado => ({ value: estado, label: estado }))
    }
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