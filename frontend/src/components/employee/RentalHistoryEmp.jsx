import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  useTheme,
  Chip,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const InfoPaper = ({ children }) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: theme.palette.ming,
        color: 'white',
        textAlign: 'center',
        borderRadius: 2,
        maxWidth: 500,
        width: '100%',
        mx: 'auto',
      }}
    >
      <Typography variant="body1">{children}</Typography>
    </Paper>
  );
};

// Nueva función para formatear fecha SIN corrimiento de día por timezone
const formatDateOnly = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  try {
    // dateString esperado: "yyyy-mm-ddTHH:mm:ss" o similar
    // Solo agarramos la parte yyyy-mm-dd y la parseamos como local sin zona horaria
    const [year, month, day] = dateString.split('T')[0].split('-');
    const monthName = new Date(`${year}-${month}-01`).toLocaleString('es-AR', { month: 'long' });

    return `${parseInt(day)} de ${monthName} de ${year}`;
  } catch {
    return 'Fecha inválida';
  }
};

const EmployeeRentals = () => {
  const theme = useTheme();
  const [rentals, setRentals] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeResponse = await apiClient.post('/employee_detail', {
          employee_id: sessionStorage.getItem('userId'),
        });

        if (!employeeResponse.data) {
          throw new Error('No se pudo obtener la información del empleado');
        }

        const branchesResponse = await apiClient.get('/get_branches');
        const allBranches = branchesResponse.data || [];
        setBranches(allBranches);

        setBranchName(employeeResponse.data.branch_name || 'Sucursal desconocida');

        const rentalsResponse = await apiClient.get('/rentals_for_pickup_branch');
        setRentals(rentalsResponse.data?.message ? [] : rentalsResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRentalStatus = (rental) => {
    if (rental.is_rented == 3) {
      return { text: 'Devuelto', color: 'info' };
    }
    return { text: 'Activo', color: 'success' };
  };

  const getReturnBranchInfo = (branchId) => {
    if (!branchId) return { name: 'No especificada', address: '' };
    const branch = branches.find((b) => b.branch_id === branchId);
    return branch ? { name: branch.name, address: branch.address } : { name: 'Sucursal no encontrada', address: '' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <InfoPaper>{error}</InfoPaper>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      pb={6}
      pt={4}
      sx={{
        overflowX: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 1000,
          px: 2,
          py: 3,
          backgroundColor: theme.palette.beige,
          borderRadius: 4,
          mx: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Alquileres Activos - Sucursal {branchName}
          </Typography>
          <Divider
            sx={{
              mb: 3,
              backgroundColor: theme.palette.charcoal,
              height: 2,
            }}
          />

          {rentals.length > 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {rentals.map((rental, index) => {
                const status = getRentalStatus(rental);
                const returnBranch = getReturnBranchInfo(rental.branch_id_return);

                return (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.charcoal,
                      color: theme.palette.beige,
                      borderRadius: 2,
                      width: { xs: '100%', sm: '48%' },
                      boxSizing: 'border-box',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {rental.name}
                      </Typography>
                      <Chip label={status.text} color={status.color} size="small" />
                    </Box>

                    <Typography variant="body2" paragraph>
                      <strong>Patente:</strong> {rental.number_plate}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Categoría:</strong> {rental.name}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Cliente:</strong> {rental.email}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Teléfono:</strong> {rental.phone_number}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Retiro:</strong> {formatDateOnly(rental.pickup_datetime)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Devolución estimada:</strong> {formatDateOnly(rental.return_datetime)}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Devolución en:</strong> {returnBranch.name} - {returnBranch.address}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Costo total:</strong> ${rental.final_cost}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 150,
                width: '100%',
              }}
            >
              <InfoPaper>No hay alquileres activos en esta sucursal.</InfoPaper>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeRentals;
