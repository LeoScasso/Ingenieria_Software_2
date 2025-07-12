import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Button,
  Chip,
  useTheme,
} from '@mui/material';
import apiClient from '../../middleware/axios';

// formatDate igual que antes, sin timezone bugs
const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';

  const [year, month, day] = dateString.split('T')[0].split('-'); 
  const monthName = new Date(`${year}-${month}-01`).toLocaleString('es-AR', { month: 'long' });

  return `${parseInt(day)} de ${monthName} de ${year}`;
};

const ReturnRentals = () => {
  const theme = useTheme();
  const [rentals, setRentals] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const empRes = await apiClient.post('/employee_detail', {
        employee_id: sessionStorage.getItem('userId'),
      });
      setBranchName(empRes.data?.branch_name || 'Sucursal desconocida');

      const res = await apiClient.get('/rentals_for_return_branch');
      setRentals(res.data?.message ? [] : res.data);
    } catch (err) {
      console.error(err);
      window.alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (rentalId) => {
    try {
      const res = await apiClient.post('/register_return', { rental_id: rentalId });

      if (res.data?.days) {
        window.alert(`Vehículo entregado tarde. Días de atraso: ${res.data.days}, recargo: $${res.data.aditional}`);
      } else {
        window.alert(res.data.message || 'Devolución registrada exitosamente');
      }

      fetchData(); // refresca lista
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar la devolución';
      window.alert(msg);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" py={4} px={2}>
      <Card sx={{ width: '100%', maxWidth: 1000, p: 3, backgroundColor: theme.palette.beige, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h4" fontWeight="bold" textAlign="center" color={theme.palette.darkBlue} gutterBottom>
            Devoluciones - Sucursal {branchName}
          </Typography>
          <Divider sx={{ mb: 3, backgroundColor: theme.palette.charcoal, height: 2 }} />

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
          ) : rentals.length === 0 ? (
            <Typography variant="body1" textAlign="center">No hay vehículos pendientes de devolución.</Typography>
          ) : (
            <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
              {rentals.map((rental, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    backgroundColor: theme.palette.charcoal,
                    color: theme.palette.beige,
                    borderRadius: 2,
                    width: { xs: '100%', sm: '48%' },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight="bold">{rental.name}</Typography>
                    <Chip label="Activo" color="success" size="small" />
                  </Box>

                  <Typography variant="body2" paragraph><strong>Patente:</strong> {rental.number_plate}</Typography>
                  <Typography variant="body2" paragraph><strong>Cliente:</strong> {rental.email}</Typography>
                  <Typography variant="body2" paragraph><strong>Teléfono:</strong> {rental.phone_number}</Typography>
                  <Typography variant="body2" paragraph><strong>Retiro:</strong> {formatDate(rental.pickup_datetime)}</Typography>
                  <Typography variant="body2" paragraph><strong>Devolución estimada:</strong> {formatDate(rental.return_datetime)}</Typography>
                  <Typography variant="body2" paragraph><strong>Costo total:</strong> ${rental.final_cost}</Typography>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2, backgroundColor: '#f57c00', '&:hover': { backgroundColor: '#ef6c00' } }}
                    onClick={() => {
                      if (window.confirm('¿Confirmás la devolución de este vehículo?')) {
                        handleReturn(rental.rental_id);
                      }
                    }}
                  >
                    Registrar devolución
                  </Button>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ReturnRentals;
