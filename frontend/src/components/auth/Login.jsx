import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const Login = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  // Estado para mensajes de éxito o error
  const [message, setMessage] = useState(null)
  const [isError, setIsError] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()
  setMessage(null)  // limpio mensaje previo
  setIsError(false)
  try {
    const response = await apiClient.post('/login', formData)
    const data = response.data

    sessionStorage.setItem('userId', data.user_id)
    sessionStorage.setItem('role', data.user_role)
    sessionStorage.setItem('name', data.user_name)

    alert(data.message || 'Inicio de sesión exitoso.')
    navigate('/')
  } catch (error) {
    let errorMsg = 'Error inesperado en el login.'

    if (error.response) {
      // Agarro error.response.data.message o error.response.data.error o fallback
      errorMsg =
        error.response.data.message ||
        error.response.data.error ||
        'Error del servidor.'
      alert(`Fallo en el login: ${errorMsg}`)
    } else if (error.request) {
      errorMsg = 'No se recibió respuesta del servidor.'
      alert(`Fallo en el login: ${errorMsg}`)
    } else {
      errorMsg = error.message
      alert(`Fallo en el login: ${errorMsg}`)
    }
    setMessage(errorMsg)
    setIsError(true)
  }
}

  const fields = [
    {
      name: 'email',
      label: 'Correo Electrónico',
      type: 'email',
      value: formData.email, // corregí aquí, antes tenías formData.mail que no existe
      onChange: handleChange,
      required: true,
      autoComplete: 'email',
      autoFocus: true,
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: showPassword ? 'text' : 'password',
      value: formData.password,
      onChange: handleChange,
      required: true,
      // Pasamos el toggle como prop extra para el input, si tu Form lo maneja
      showPassword: showPassword,
      onTogglePassword: () => setShowPassword(!showPassword),
      autoComplete: 'current-password',
    },
  ]

  return (
    <>
      <Form
        title="Iniciar Sesión"
        fields={fields}
        onSubmit={handleSubmit}
        submitButtonText="Ingresar"
      />
      {message && (
        <div
          style={{
            marginTop: '1rem',
            color: isError ? 'red' : 'green',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}
    </>
  )
}

export default Login
