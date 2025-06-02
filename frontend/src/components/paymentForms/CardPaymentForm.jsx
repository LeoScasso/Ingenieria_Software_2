import React, { useState } from 'react'
import { Typography } from '@mui/material'
import Form from '../common/Form'
import { useNavigate, useLocation } from 'react-router-dom'
import apiClient from '../../middleware/axios'

const tarjetas = [
  {
    numero: '4444',
    codigo: '123',
    titular: 'usuario1',
    saldo: 999999999,
  },
  {
    numero: '5555',
    codigo: '123',
    titular: 'usuario1',
    saldo: 0,
  },
]

const CardPaymentForm = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const formDataReserva = location.state

    const [formData, setFormData] = useState({
        card_number: '',
        sec_number: '',
        titular_name: '',
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { card_number, sec_number, titular_name } = formData
        const tarjeta = tarjetas.find((t) => t.numero === card_number)

        if (!tarjeta) return alert('El número de tarjeta ingresado no es válido')
        if (tarjeta.codigo !== sec_number) return alert('El código de seguridad es incorrecto')
        if (tarjeta.titular !== titular_name) return alert('El titular de la tarjeta no coincide')
        if (tarjeta.saldo <= 0) return alert('Saldo insuficiente')

        try {
            console.log("Datos enviados al backend:", formDataReserva)
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
        },
    ]

  return (
    <>
      <Form
        title="Pago con Tarjeta"
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Pagar"
      >
        <Typography variant="h6" color="white" sx={{ textAlign: 'center', mb: 2 }}>
            Cantidad a pagar: {formDataReserva?.totalCost?.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) ?? '—'}
        </Typography>
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

export default CardPaymentForm
