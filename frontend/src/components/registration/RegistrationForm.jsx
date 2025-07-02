import React, { useState } from 'react'
import { Typography } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'
import { useNavigate } from 'react-router-dom'

const RegistrationForm = () => {
  const navigate = useNavigate()
  const userRole = sessionStorage.getItem('role')

  const isEmployee = userRole === 'employee'

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    last_name: '',
    dni: '',
    phone_number: '',
    showPassword: false,
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const togglePassword = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isEmployee) {
      if (formData.password !== formData.confirmPassword) {
        alert('Las contraseñas no coinciden')
        return
      }

      if (formData.password.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres')
        return
      }
    }

    // Crear objeto sin campos innecesarios
    const {
      confirmPassword,
      showPassword,
      ...dataToSend
    } = formData

    if (isEmployee) {
      delete dataToSend.password
    }

    try {
      const response = await apiClient.post('/registration', dataToSend)

      if (response.status === 200) {
        if (isEmployee && response.data.password) {
          alert(`${response.data.message}\nContraseña generada: ${response.data.password}`)
        } else {
          alert(response.data.message)
        }
        navigate('/')
      } else {
        alert('Registro fallido: Respuesta inesperada del servidor')
        console.warn('Respuesta inesperada:', response)
      }
    } catch (error) {
      if (error.response) {
        console.error('Registro fallido - Respuesta del servidor:', error.response.data)
        alert('Registro fallido: ' + (error.response.data.message || 'Error del servidor'))
      } else if (error.request) {
        console.error('Registro fallido - No hubo respuesta:', error.request)
        alert('Error de registro: No hubo respuesta del servidor.')
      } else {
        console.error('Error en el registro - Setup:', error.message)
        alert('Error en el registro: ' + error.message)
      }
    }
  }

  const fields = [
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      value: formData.email,
      onChange: handleChange,
      required: true,
      autoComplete: 'email',
      autoFocus: true,
    },
    !isEmployee && {
      name: 'password',
      label: 'Contraseña (Mínimo 8 caracteres)',
      type: 'password',
      value: formData.password,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-password',
      showPassword: formData.showPassword,
      onTogglePassword: togglePassword,
    },
    !isEmployee && {
      name: 'confirmPassword',
      label: 'Confirmar Contraseña',
      type: 'password',
      value: formData.confirmPassword,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-password',
      showPassword: formData.showPassword,
      onTogglePassword: togglePassword,
    },
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      value: formData.name,
      onChange: handleChange,
      required: true,
      autoComplete: 'given-name',
    },
    {
      name: 'last_name',
      label: 'Apellido',
      type: 'text',
      value: formData.last_name,
      onChange: handleChange,
      required: true,
      autoComplete: 'family-name',
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      value: formData.dni,
      onChange: handleChange,
      required: true,
      autoComplete: 'off',
    },
    {
      name: 'phone_number',
      label: 'Teléfono',
      type: 'tel',
      value: formData.phone_number,
      onChange: handleChange,
      required: true,
      autoComplete: 'tel',
    },
  ].filter(Boolean) // 🔥 Esto limpia los `false` si `!isEmployee`

  return (
    <Form
      title="Formulario de Registro"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText={isEmployee ? 'Registrar cliente' : 'Registrarse'}
    >
      <Typography variant="body2" color="white" sx={{ textAlign: 'center', mt: 2 }}>
        Todos los campos son obligatorios
      </Typography>
    </Form>
  )
}

export default RegistrationForm
