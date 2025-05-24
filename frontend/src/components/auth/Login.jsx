import React, { useState } from 'react'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/login', formData)
      const data = response.data

      localStorage.setItem('userId', data.user_id)
      localStorage.setItem('role', data.role)
      alert(data.message)
    } catch (error) {
      if (error.response) {
        console.error('Login failed - Server responded:', error.response.data)
        alert(
          'Login failed: ' + (error.response.data.message || 'Server error')
        )
      } else if (error.request) {
        console.error('Login failed - No response:', error.request)
        alert('Login error: No response from server.')
      } else {
        console.error('Login error - Request setup:', error.message)
        alert('Login error: ' + error.message)
      }
    }
  }

  const fields = [
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      value: formData.mail,
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
      showPassword: showPassword,
      onTogglePassword: () => setShowPassword(!showPassword),
      autoComplete: 'current-password',
    },
  ]

  return (
    <Form
      title="Iniciar Sesión"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Ingresar"
    />
  )
}

export default Login
