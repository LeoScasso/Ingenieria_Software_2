import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from '../common/Form'
import { Typography } from '@mui/material'

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

const WalletPaymentForm = ({ amount }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    wallet_id: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const { wallet_id } = formData
    const billetera = billeteras.find((b) => b.id === wallet_id)

    if (!billetera) {
      alert('El ID ingresado no corresponde a ninguna billetera registrada.')
      return
    }

    if (billetera.saldo <= 0) {
      alert('La billetera no dispone de saldo suficiente.')
      return
    }

    alert('¡Pago exitoso!')
    navigate('/')
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
          Cantidad a pagar: ${amount}
        </Typography>
        <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 2 }}>
          Todos los campos son obligatorios
        </Typography>
      </Form>
    </>
  )
}

export default WalletPaymentForm
