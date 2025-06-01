import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography } from '@mui/material'
import Form from '../common/Form'
import apiClient from '../../middleware/axios'

// Simulación de billeteras hardcodeadas
const billeteras = [
  {
    id: '111',
    titular: 'usuario1',
    saldo: 999999999,
  },
  {
    id: '222',
    titular: 'usuario2',
    saldo: 0,
  },
]

const WalletPaymentForm = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const formDataReserva = location.state

  const [formData, setFormData] = useState({
    wallet_id: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { wallet_id, titular_name } = formData
    const billetera = billeteras.find((b) => b.id === wallet_id)

    if (!billetera) return alert('La billetera ingresada no es válida')
    if (billetera.saldo <= 0) return alert('Saldo insuficiente')

    try {
      console.log('Datos enviados al backend:', formDataReserva)
      const response = await apiClient.post('/reserve', formDataReserva)
      alert(`¡Pago exitoso! ${response.data.message}`)
      navigate('/')
    } catch (error) {
      console.error(error)
      alert('Ocurrió un error al registrar la reserva')
    }
  }

  const fields = [
    {
      name: 'wallet_id',
      label: 'ID de la Billetera',
      type: 'text',
      value: formData.wallet_id,
      onChange: handleChange,
      required: true,
      autoComplete: 'wallet-id',
      autoFocus: true,
    },
  ]

  return (
    <>
      <Form
        title="Pago con Billetera Virtual"
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Pagar"
      >
        <Typography variant="h6" color="white" sx={{ textAlign: 'center', mb: 2 }}>
          Cantidad a pagar:{' '}
          {formDataReserva?.totalCost?.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
          }) ?? '—'}
        </Typography>
        <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 2 }}>
          Todos los campos son obligatorios
        </Typography>
      </Form>
    </>
  )
}

export default WalletPaymentForm
