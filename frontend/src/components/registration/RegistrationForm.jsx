import React, { useState } from 'react'
import { Typography, Box, useTheme } from '@mui/material'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'
import { useNavigate } from 'react-router-dom'


const RegistrationForm = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    last_name: '',
    dni: '',
    phone_number: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const togglePassword = () => {
    setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    try {
      const response = await apiClient.post('/registration', formData);
      const data = response.data;
      alert(data.message);
      navigate('/login');
    } catch (error) {
      if (error.response) {
        console.error('Registration failed - Server responded:', error.response.data);
        alert('Registro fallido: ' + (error.response.data.message || 'Server error  '));
      } else if (error.request) {
        console.error('Registration failed - No response:', error.request);
        alert('Registration error: No response from server.');
      } else {
        console.error('Registration error - Request setup:', error.message);
        alert('Registration error: ' + error.message);
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
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      value: formData.password,
      onChange: handleChange,
      required: true,
      autoComplete: 'new-password',
      showPassword: formData.showPassword,
      onTogglePassword: togglePassword,
    },
    {
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
      value: formData.lastName,
      onChange: handleChange,
      required: true,
      autoComplete: 'family-name',
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      value: formData.DNI,
      onChange: handleChange,
      required: true,
      autoComplete: 'off',
    },
    {
      name: 'phone_number',
      label: 'Teléfono',
      type: 'tel',
      value: formData.phone,
      onChange: handleChange,
      required: true,
      autoComplete: 'tel',
    },
  ]

  return (
    <Form
      title="Formulario de Registro"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Registrarse"
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

export default RegistrationForm
