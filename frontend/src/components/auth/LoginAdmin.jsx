import { Button, InputAdornment } from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

export const LoginAdmin = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [code2FA, setCode2FA] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code2FA: '',
  })

  const generateRandomCode = () => {
    // Random code: Math.floor(100000 + Math.random() * 900000)
    const code = '12345'
    alert(`Tu código 2FA es: ${code}`)
    setCode2FA(code)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.code2FA !== code2FA) {
      alert('Código 2FA incorrecto!')
      return
    }
    try {
      const response = await apiClient.post('/login', formData)
      const data = response.data
      localStorage.setItem('userId', data.user_id)
      localStorage.setItem('role', data.user_role)
      alert(data.message)
      navigate('/')
    } catch (error) {
      console.error('Login failed - Server responded:', error.response.data)
      alert('Login failed: ' + (error.response.data.message || 'Server error'))
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
      showPassword: showPassword,
      onTogglePassword: () => setShowPassword(!showPassword),
      autoComplete: 'current-password',
    },
    {
      name: 'code2FA',
      label: 'Código 2FA',
      type: 'text',
      value: formData.code2FA,
      onChange: handleChange,
      required: true,
      autoComplete: 'one-time-code',
      additionalProps: {
        InputProps: {
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={generateRandomCode}
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#45a049',
                  },
                }}
              >
                Enviar código 2FA
              </Button>
            </InputAdornment>
          ),
        },
      },
    },
  ]

  return (
    <Form
      title="Iniciar Sesión como Admin"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Ingresar"
    />
  )
}
