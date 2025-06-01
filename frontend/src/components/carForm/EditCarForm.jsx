import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const EditCarForm = () => {
  const location = useLocation()
  const vehicleFromState = location.state?.vehicle

  const [formData, setFormData] = useState({
    vehicle_id: vehicleFromState?.vehicle_id || '',
    number_plate: vehicleFromState?.number_plate || '',
    category: vehicleFromState?.category || '',
    condition: vehicleFromState?.condition || '',
    cancelation_policy: vehicleFromState?.name || '',
    model: vehicleFromState?.model || '',
    year: vehicleFromState?.year || '',
    brand: vehicleFromState?.brand || '',
    price_per_day: vehicleFromState?.price_per_day || '',
    max_capacity: vehicleFromState?.max_capacity || '',
    minimum_rental_days: vehicleFromState?.minimum_rental_days || '',
  })

  const [categories, setCategories] = useState([])

  const carBrands = ['Marca A', 'Marca B']

  const modelsByBrand = {
    'Marca A': ['Modelo A1', 'Modelo A2'],
    'Marca B': ['Modelo B1', 'Modelo B2'],
  }

  const cancelationPolicies = [
    '100% de devolucion',
    '20% de devolucion',
    'Sin devolucion',
  ]

  const estados = ['Disponible', 'Alquilado', 'En mantenimiento']

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiClient.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Error al obtener categorías:', error)
      }
    }

    getCategories()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChangeBrand = (e) => {
    setFormData({ ...formData, brand: e.target.value, model: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.put('/update_vehicle', formData)
      alert(response.data.message)
    } catch (error) {
      if (error.response) {
        console.error(
          'Error al actualizar - respuesta del servidor:',
          error.response.data
        )
        alert('Error: ' + (error.response.data.message || 'Error del server'))
      } else if (error.request) {
        console.error(
          'Error al actualizar - sin respuesta del servidor:',
          error.request
        )
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
      options: formData.brand
        ? modelsByBrand[formData.brand]?.map((model) => ({
            value: model,
            label: model,
          })) || []
        : [{ value: '', label: 'Seleccione una marca primero' }],
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
      name: 'price_per_day',
      label: 'Precio por día',
      type: 'number',
      value: formData.price_per_day,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-price',
    },
    {
      name: 'max_capacity',
      label: 'Capacidad máxima',
      type: 'number',
      value: formData.max_capacity,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-capacity',
    },
    {
      name: 'minimum_rental_days',
      label: 'Días mínimos de alquiler',
      type: 'number',
      value: formData.minimum_rental_days,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-min-days',
    },
    {
      name: 'cancelation_policy',
      label: 'Política de cancelación',
      type: 'select',
      value: formData.cancelation_policy,
      onChange: handleChange,
      required: true,
      autoComplete: 'edit-policy',
      options: cancelationPolicies.map((policy) => ({
        value: policy,
        label: policy,
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
