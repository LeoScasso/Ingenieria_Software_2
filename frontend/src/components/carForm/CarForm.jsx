import React, { useState, useEffect } from 'react'
import { Typography } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const CarForm = () => {

  const [formData, setFormData] = useState({
    'number_plate': '',
    'category': '',
    'condition': '',
    'cancelation_policy': '',
    'model': '',
    'year': '',
    'brand': ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleChangeBrand = (e) => {
    setFormData({ ...formData, model: '', brand: e.target.value })  
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/vehicle_registration', formData);
      const data = response.data;
      alert(data.message);
    } catch (error) {
      if (error.response) {
        console.error('Falló el alta - Respuesta del servidor: ', error.response.data);
        alert('Ocurrió un error: ' + (error.response.data.message || 'Error del server'));
      } else if (error.request) {
        console.error('Falló el alta - No hubo respuesta:', error.request);
        alert('Falló el alta: No hubo respuesta del servidor.');
      } else {
        console.error('Registration error - Request setup:', error.message);
        alert('Error en el alta de vehículo: ' + error.message);
      }
    }
  } 
  
  const carBrands = [
    'Marca A',
    'Marca B'
  ]

  const modelsByBrand = {
    'Marca A': ['Modelo A1', 'Modelo A2'],
    'Marca B': ['Modelo B1', 'Modelo B2'],
  }

  const cancelationPolicies = [
    '100% de devolucion',
    '20% de devolucion',
    'Sin devolucion'
  ]

  const estados = [
    "Disponible",
    "Alquilado",
    "En mantenimiento",
  ]

  const [categories, setCategories] = useState([])

  const getCategories = async () => {
    const response = await apiClient.get('/categories')
    setCategories(response.data)
  }

  useEffect(() => {
    getCategories()
  }, [])

  const fields = [
    {
        name: 'number_plate',
        label: 'Patente',
        type: 'text',
        value: formData.number_plate,
        onChange: handleChange,
        required: true,
        autoComplete: 'new-number_plate',
        autoFocus: true
    },
    {
        name: 'brand',
        label: 'Marca',
        type: 'select',
        value: formData.brand,
        onChange: handleChangeBrand,
        required: true,
        autoComplete: 'new-brand',
        options: carBrands.map(brand => ({ value: brand, label: brand }))
    },
    {
        name: 'model',
        label: 'Modelo',
        type: 'select',
        value: formData.model,
        onChange: handleChange,
        required: true,
        autoComplete: 'new-model',
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
        autoComplete: 'new-category',
        options: categories.map(name => ({
          value: name,
          label: name
        }))
    },
    {
        name: 'year',
        label: 'Año',
        type: 'number',
        value: formData.year,
        onChange: handleChange,
        required: true,
        autoComplete: 'new-year'
    },
    {
        name: 'cancelation_policy',
        label: 'Política de Cancelación',
        type: 'select',
        value: formData.cancellation_policy,
        onChange: handleChange,
        required: true,
        autoComplete: 'new-cancellation_policy',
        options: cancelationPolicies.map(policy => ({ value: policy, label: policy }))
    },
    {
        name: 'condition',
        label: 'Condición',
        type: 'select',
        value: formData.condition,
        onChange: handleChange,
        required: true,
        autoComplete: 'new-description',
        options: estados.map(estado => ({ value: estado, label: estado }))
    }
  ]

  return (
    <Form
      title="Formulario de alta de vehículo"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Registrar Vehículo"
    >
      <Typography
        variant="body2"
        color="white"
        sx={{ textAlign: 'center', mt: 2 }}
      >
        Todos los campos son obligatorios
      </Typography>   
    </Form>   
  )
}

export default CarForm
