import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  IconButton,
  Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../middleware/axios';

// Celdas encabezado
const HeaderCell = ({ children }) => (
  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
    {children}
  </TableCell>
);

// Celdas cuerpo
const BodyCell = ({ children }) => {
  const theme = useTheme();
  return (
    <TableCell
      sx={{
        color: theme.palette.charcoal,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      {children}
    </TableCell>
  );
};

export const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const theme = useTheme();
  const navigate = useNavigate();

  const getEmployees = async () => {
    try {
      const response = await apiClient.get('/get_employees');
      const sortedEmployees = response.data.sort((a, b) =>
        (a.name_1 || '').localeCompare(b.name_1 || '')
      );
      setEmployees(sortedEmployees);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  };

  useEffect(() => {
    getEmployees();
  }, []);

  const handleDelete = async (employee_id) => {
    const empleado = employees.find((e) => e.employee_id === employee_id);
    const empleadosMismaSucursal = employees.filter(
      (e) => e.name_1 === empleado.name_1
    );

    // Confirmación base
    if (!window.confirm('¿Estás seguro que querés eliminar este empleado?')) return;

    // Si es el único de su sucursal, mostrar alerta extra
    if (empleadosMismaSucursal.length === 1) {
      const confirmarUltimo = window.confirm(
        `Este es el último empleado de la sucursal "${empleado.name_1}". ¿Querés continuar de todos modos?`
      );
      if (!confirmarUltimo) return;
    }

    try {
      await apiClient.delete('/delete_employee', { data: { employee_id } });
      alert('Empleado eliminado con éxito');
      getEmployees(); // refrescar lista después de borrar
    } catch (error) {
      console.error('Error al eliminar empleado:', error);
      alert('No se pudo eliminar el empleado');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 }}>
      {employees.length === 0 ? (
        <Paper
          elevation={3}
          sx={{
            backgroundColor: theme.palette.beige,
            padding: 4,
            mt: 2,
            maxWidth: 600,
            textAlign: 'center',
            boxShadow: `0 4px 8px ${theme.palette.slateGray}40`,
          }}
        >
          <Typography
            sx={{
              color: theme.palette.charcoal,
              fontWeight: 'bold',
              fontSize: '1.2rem',
            }}
          >
            No hay empleados para mostrar.
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            maxWidth: 'fit-content',
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: theme.palette.beige,
            boxShadow: `0 4px 8px ${theme.palette.slateGray}40`,
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.charcoal }}>
                <HeaderCell>Nombre</HeaderCell>
                <HeaderCell>Apellido</HeaderCell>
                <HeaderCell>DNI</HeaderCell>
                <HeaderCell>Email</HeaderCell>
                <HeaderCell>Teléfono</HeaderCell>
                <HeaderCell>Sucursal</HeaderCell>
                <HeaderCell>Acciones</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow
                  key={emp.employee_id}
                  sx={{
                    backgroundColor: theme.palette.beige,
                    '&:hover': { backgroundColor: `${theme.palette.beanBlue}30` },
                  }}
                >
                  <BodyCell>{emp.name}</BodyCell>
                  <BodyCell>{emp.last_name}</BodyCell>
                  <BodyCell>{emp.dni}</BodyCell>
                  <BodyCell>{emp.email}</BodyCell>
                  <BodyCell>{emp.phone_number}</BodyCell>
                  <BodyCell>{emp.name_1}</BodyCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton
                      onClick={() =>
                        navigate('/employees/detail', {
                          state: { employee_id: emp.employee_id },
                        })
                      }
                      sx={{
                        mr: 1,
                        borderRadius: '10px',
                        backgroundColor: theme.palette.slateGray,
                        color: theme.palette.beige,
                        '&:hover': { backgroundColor: theme.palette.beanBlue },
                      }}
                      title="Ver detalle del empleado"
                    >
                      <VisibilityIcon />
                    </IconButton>

                    <IconButton
                      onClick={() =>
                        navigate('/employees/edit', { state: { employee: emp } })
                      }
                      sx={{
                        mr: 1,
                        borderRadius: '10px',
                        backgroundColor: theme.palette.ming,
                        color: theme.palette.beige,
                        '&:hover': { backgroundColor: theme.palette.darkBlue },
                      }}
                      title="Editar empleado"
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => handleDelete(emp.employee_id)}
                      sx={{
                        borderRadius: '10px',
                        backgroundColor: theme.palette.error.main,
                        color: theme.palette.beige,
                        '&:hover': { backgroundColor: theme.palette.error.dark },
                      }}
                      title="Eliminar empleado"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};
