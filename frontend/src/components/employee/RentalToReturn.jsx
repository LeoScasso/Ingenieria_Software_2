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
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const ReturnRentals = () => {
  const theme = useTheme();
  const [rentals, setRentals] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const showMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

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
      showMessage('Error al cargar los datos', 'error');
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
        showMessage(`Vehículo entregado tarde. Días de atraso: ${res.data.days}, recargo: $${res.data.aditional}`, 'warning');
      } else {
        showMessage(res.data.message || 'Devolución registrada exitosamente', 'success');
      }

      fetchData(); // Refresh rentals
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar la devolución';
      showMessage(msg, 'error');
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReturnRentals;
