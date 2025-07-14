import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import apiClient from '../../middleware/axios'
import Form from '../common/Form'

const EditEmployeeForm = () => {
  const location = useLocation()
  const employeeFromState = location.state?.employee

  const [branches, setBranches] = useState([])

  // Filtrar sucursales activas (status 0) - excluir status 1 y 2
  const activeBranches = branches.filter((branch) => branch.branch_status === 0)

  const [formData, setFormData] = useState({
    employee_id: employeeFromState?.employee_id || '',
    name: employeeFromState?.name || '',
    last_name: employeeFromState?.last_name || '',
    dni: employeeFromState?.dni || '',
    email: employeeFromState?.email || '',
    phone_number: employeeFromState?.phone_number || '',
    password: employeeFromState?.password || '',
    branch: employeeFromState?.name_1 || '', // ← nombre de la sucursal
  })

  useEffect(() => {
    const getBranches = async () => {
      try {
        const res = await apiClient.get('/get_branches')
        setBranches(res.data)

        if (employeeFromState?.name_1 && !formData.branch) {
          setFormData((prev) => ({
            ...prev,
            branch: employeeFromState.name_1,
          }))
        }
      } catch (err) {
        console.error('Error al obtener sucursales:', err)
      }
    }

    getBranches()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const selectedBranch = activeBranches.find(
        (b) => b.name === formData.branch
      )
      if (!selectedBranch) {
        alert('Sucursal seleccionada inválida.')
        return
      }

      const payload = {
        ...formData,
        branch: selectedBranch.name,
      }

      const res = await apiClient.put('/edit_employee', payload)
      alert(res.data.message)
    } catch (err) {
      if (err.response) {
        alert('Error: ' + (err.response.data.message || 'Error del servidor.'))
      } else if (err.request) {
        alert('Error: No hubo respuesta del servidor.')
      } else {
        alert('Error: ' + err.message)
      }
    }
  }

  const fields = [
    {
      name: 'name',
      label: 'Nombre',
      type: 'text',
      value: formData.name,
      onChange: handleChange,
      required: true,
      autoFocus: true,
    },
    {
      name: 'last_name',
      label: 'Apellido',
      type: 'text',
      value: formData.last_name,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'dni',
      label: 'DNI',
      type: 'text',
      value: formData.dni,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      value: formData.email,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'phone_number',
      label: 'Teléfono',
      type: 'text',
      value: formData.phone_number,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      value: formData.password,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'branch',
      label: 'Sucursal',
      type: 'select',
      value: formData.branch,
      onChange: handleChange,
      required: true,
      options: activeBranches.map((b) => ({
        value: b.name,
        label: `${b.name} - ${b.address}`,
      })),
    },
  ]

  return (
    <Form
      title="Editar Empleado"
      fields={fields}
      onSubmit={handleSubmit}
      submitButtonText="Guardar Cambios"
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

export default EditEmployeeForm
