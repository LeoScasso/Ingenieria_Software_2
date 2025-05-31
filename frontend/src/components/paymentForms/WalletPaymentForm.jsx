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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { card_number, sec_number, titular_name } = formData
    const tarjeta = tarjetas.find((t) => t.numero === card_number)

    if (!tarjeta) return alert('El número de tarjeta ingresado no es válido')
    if (tarjeta.codigo !== sec_number) return alert('Código incorrecto')
    if (tarjeta.titular !== titular_name) return alert('Titular incorrecto')
    if (tarjeta.saldo <= 0) return alert('Saldo insuficiente')

    try {
      const response = await fetch('/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataReserva),
      })

      if (!response.ok) throw new Error('Error en el servidor')

      const data = await response.json()
      alert(`¡Pago exitoso! ${data.message}`)
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
