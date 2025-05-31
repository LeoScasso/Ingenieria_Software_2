import React, { useState, useEffect } from 'react'
import { Typography, Stack, Button } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'
import { useNavigate } from 'react-router-dom'

const ReservationForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    pickup_datetime: '',
    return_datetime: '',
    category: '',
    branch: '',
  })

  const [categories, setCategories] = useState([])
  const [branches, setBranches] = useState([])

  const requiredFields = ['pickup_datetime', 'return_datetime', 'category', 'branch']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (method) => {
    const isComplete = requiredFields.every((field) => {
      const value = formData[field]
      return value !== undefined && value !== null && value !== ''
    })

    if (!isComplete) {
      alert('Faltan campos obligatorios en el formulario')
      return
    }

    navigate(`/pago/${method}`, { state: formData })
  }

  useEffect(() => {
    const getCategories = async () => {
      try {
        const response = await apiClient.get('/categories')
        setCategories(response.data)
      } catch (error) {
        console.error('Error al cargar categorías', error)
      }
    }

    const getBranches = async () => {
      try {
        const response = await apiClient.get('/branches')
        setBranches(response.data)
      } catch (error) {
        console.error('Error al cargar sucursales', error)
      }
    }

    getCategories()
    getBranches()
  }, [])

  const fields = [
    {
      name: 'pickup_datetime',
      label: 'Fecha de retiro',
      type: 'date',
      value: formData.pickup_datetime,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-pickup_datetime',
    },
    {
      name: 'return_datetime',
      label: 'Fecha de devolución',
      type: 'date',
      value: formData.return_datetime,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-return_datetime',
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      value: formData.category,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-category',
      options: categories.map((name) => ({
        value: name,
        label: name,
      })),
    },
    {
      name: 'branch',
      label: 'Sucursal',
      type: 'select',
      value: formData.branch,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-branch',
      options: branches.map((name) => ({
        value: name,
        label: name,
      })),
    },
  ]

  return (
    <>
      <Form title="Reservar Vehículo" fields={fields}>
        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={() => handleSubmit('card')}>
            Pagar con Tarjeta
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleSubmit('wallet')}>
            Pagar con Billetera Virtual
          </Button>
        </Stack>
        <Typography
          variant="body2"
          color="white"
          sx={{ textAlign: 'center', mt: 2 }}
        >
          Todos los campos son obligatorios
        </Typography>
      </Form>
    </>
  )
}

export default ReservationForm
