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
  const [totalCost, setTotalCost] = useState(null)

  const requiredFields = ['pickup_datetime', 'return_datetime', 'category', 'branch']

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Calcular costo total cuando cambian las fechas o la categoría
    useEffect(() => {
    const { pickup_datetime, return_datetime, category } = formData
    if (pickup_datetime && return_datetime && category) {
        const pickupDate = new Date(pickup_datetime)
        const returnDate = new Date(return_datetime)
        if (returnDate < pickupDate) {
            setTotalCost(null)
            return
        }
        const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24))
        const categoryObj = categories.find((c) => c.category_id === parseInt(category))
        if (categoryObj) {
            setTotalCost(days * categoryObj.price_per_day)
        } else {
            setTotalCost(null)
        }
    } else {
        setTotalCost(null)
    }
    }, [formData.pickup_datetime, formData.return_datetime, formData.category, categories])

    const handleSubmit = (method) => {
        // Validación campos completos
        const isComplete = requiredFields.every((field) => {
            const value = formData[field]
            return value !== undefined && value !== null && value !== ''
        })

        if (!isComplete) {
            alert('Faltan campos obligatorios en el formulario')
            return
        }

        // Validación fechas coherentes
        const pickupDate = new Date(formData.pickup_datetime)
        const returnDate = new Date(formData.return_datetime)
        if (returnDate < pickupDate) {
            alert('La fecha de devolución no puede ser anterior a la fecha de retiro')
            return
        }

        // Validación mínimo de días
        const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24))
        const selectedCategory = categories.find((c) => c.category_id === parseInt(formData.category))
        if (selectedCategory && days < selectedCategory.minimum_rental_days) {
            alert(`La categoría seleccionada requiere un mínimo de ${selectedCategory.minimum_rental_days} día(s) de alquiler.`)
            return
        }

        // Si todo está ok, ¡a pagar!
        navigate(`/payment/${method}`, { state: { ...formData, totalCost } })
    }


  useEffect(() => {
    const getCategories = async () => {
    try {
        const response = await apiClient.get('/get_categories')
        setCategories(response.data)
    } catch (error) {
        console.error('Error al cargar categorías', error)
    }
    }

    const getBranches = async () => {
      try {
        const response = await apiClient.get('/get_branches')
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
      options: categories.map((cat) => ({
          value: cat.category_id,
          label: `${cat.name} - $${cat.price_per_day}/día - ${cat.minimum_rental_days} día(s) mínimo`,
      })) 
    },
    {
      name: 'branch',
      label: 'Sucursal',
      type: 'select',
      value: formData.branch,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-branch',
      options: branches.map((branch) => ({
        value: branch.name,
        label: `${branch.name} - ${branch.address}`,
      })),
    },
  ]

  return (
    <>
      <Form title="Reservar Vehículo" fields={fields}>
        <Typography
          variant="h6"
          color="white"
          sx={{ textAlign: 'center', mb: 2 }}
        >
          {totalCost !== null
            ? `Costo total estimado: $${totalCost}`
            : 'Seleccione fechas y categoría para ver el costo'}
        </Typography>

        <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={() => handleSubmit('card')}>
            Pagar con Tarjeta
          </Button>
          <Button variant="contained" color="secondary" onClick={() => handleSubmit('wallet')}>
            Pagar con Billetera Virtual
          </Button>
        </Stack>

        <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 2 }}>
          Todos los campos son obligatorios
        </Typography>
      </Form>
    </>
  )
}

export default ReservationForm
