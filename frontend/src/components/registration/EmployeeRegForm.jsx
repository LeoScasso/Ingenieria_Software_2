import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const EmployeeRegForm = () => {
  const navigate = useNavigate()

  const [branches, setBranches] = useState([])

  // Filtrar sucursales activas (status 0) - excluir status 1 y 2
  const activeBranches = branches.filter((branch) => branch.branch_status === 0)

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    last_name: '',
    dni: '',
    phone_number: '',
    branch: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchesRes = await apiClient.get('/get_branches')
        setBranches(branchesRes.data)
      } catch (error) {
        console.error('Error cargando datos:', error)
      }
    }

    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await apiClient.post('/registration', formData)

      if (response.status === 200) {
        const msg = response.data.password
          ? `${response.data.message}\nContraseña generada: ${response.data.password}`
          : response.data.message

        alert(msg)
        navigate('/')
      } else {
        alert('Registro fallido: Respuesta inesperada del servidor')
        console.warn('Respuesta inesperada:', response)
      }
    } catch (error) {
      if (error.response) {
        console.error(
          'Registro fallido - Respuesta del servidor:',
          error.response.data
        )
        alert(
          'Registro fallido: ' +
            (error.response.data.message || 'Error del servidor')
        )
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
    {
      name: 'branch',
      label: 'Sucursal',
      type: 'select',
      value: formData.branch,
      onChange: handleChange,
      required: true,
      options: activeBranches.map((branch) => ({
        value: branch.name,
        label: `${branch.name} - ${branch.address}`,
      })),
    },
  ]

  return (
    <Form
      title="Formulario de Registro de Empleado"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText={'Registrar Empleado'}
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

export default EmployeeRegForm
