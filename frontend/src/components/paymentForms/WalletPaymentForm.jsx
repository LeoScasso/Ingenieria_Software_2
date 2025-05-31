import React, { useState } from 'react'
import { Typography } from '@mui/material'
import Form from '../common/Form'
import { useNavigate } from 'react-router-dom'

// Simulación de billeteras hardcodeadas
const billeteras = [
  {
    numero: '4444',
    codigo: '123',
    titular: 'usuario1',
    saldo: 999999999,
  },
  {
    numero: '5555',
    codigo: '999',
    titular: 'usuario2',
    saldo: 0,
  },
]

const CardPaymentForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    card_number: '',
    sec_number: '',
    titular_name: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const { card_number, sec_number, titular_name } = formData
    const tarjeta = tarjetas.find((t) => t.numero === card_number)

    if (!tarjeta) {
      alert('El número de tarjeta ingresado no es válido')
      return
    }

    if (tarjeta.codigo !== sec_number) {
      alert('El código de seguridad ingresado no corresponde a la tarjeta')
      return
    }

    if (tarjeta.titular !== titular_name) {
      alert('El nombre de titular ingresado no corresponde a la tarjeta')
      return
    }

    if (tarjeta.saldo <= 0) {
      alert('La tarjeta no dispone de saldo suficiente')
      return
    }

    alert('¡Pago exitoso!')
    navigate('/')
  }

  const fields = [
    {
      name: 'card_number',
      label: 'Número de Tarjeta',
      type: 'text',
      value: formData.card_number,
      onChange: handleChange,
      required: true,
      autoComplete: 'cc-number',
      autoFocus: true,
    },
    {
      name: 'sec_number',
      label: 'Código de Seguridad',
      type: 'password',
      value: formData.sec_number,
      onChange: handleChange,
      required: true,
      autoComplete: 'cc-csc',
    },
    {
      name: 'titular_name',
      label: 'Nombre del Titular',
      type: 'text',
      value: formData.titular_name,
      onChange: handleChange,
      required: true,
      autoComplete: 'cc-name',
    }
  ]

  return (
    <Form
      title="Formulario de Pago"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Pagar"
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

export default CardPaymentForm
