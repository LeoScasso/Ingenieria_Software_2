import React, { useState, useEffect } from 'react'
import { Typography } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const CarForm = () => {
  const [formData, setFormData] = useState({
    number_plate: '',
    category: '',
    condition: '',
    cancelation_policy: '',
    model: '',
    year: '',
    brand: ''
  })

  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])

  const getBrands = async () => {
    try {
      const response = await apiClient.get('/get_brands')
      setBrands(response.data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const getCategories = async () => {
    try {
      const response = await apiClient.get('/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const getModelsByBrand = async (brand) => {
    if (!brand) {
      setModels([])
      return
    }
    try {
      const response = await apiClient.get('/get_models_by_brand', {
        params: { brand }
      })
      setModels(response.data)
    } catch (error) {
      console.error('Error fetching models:', error)
      setModels([])
    }
  }

  useEffect(() => {
    getBrands()
    getCategories()
  }, [])

  useEffect(() => {
    setFormData(prev => ({ ...prev, model: '' }))
    getModelsByBrand(formData.brand)
  }, [formData.brand])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleChangeBrand = (e) => {
    const selectedBrand = e.target.value
    setFormData(prev => ({ ...prev, brand: selectedBrand, model: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/vehicle_registration', formData)
      alert(response.data.message)
    } catch (error) {
      if (error.response) {
        alert('Error: ' + (error.response.data.message || 'Error del servidor'))
      } else {
        alert('Error de conexión o inesperado: ' + error.message)
      }
    }
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
      options: brands.map(brand => ({ value: brand, label: brand }))
    },
    {
      name: 'model',
      label: 'Modelo',
      type: 'select',
      value: formData.model,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-model',
      options: models.length > 0
        ? models.map(model => ({ value: model, label: model }))
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
      options: categories.map(name => ({ value: name, label: name }))
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
      name: 'condition',
      label: 'Condición',
      type: 'select',
      value: formData.condition,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-condition',
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
