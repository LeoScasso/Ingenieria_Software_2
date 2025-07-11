import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../middleware/axios';

const politicas_cancelacion = {
  1: "100% de devolución",
  2: "20% de devolución",
  3: "Sin devolución"
};

const safeFormatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const RentalRegistration = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  const InfoPaper = ({ children }) => (
    <Paper
      sx={{
        p: 2,
        backgroundColor: theme.palette.ming,
        color: 'white',
        textAlign: 'center',
        borderRadius: 2,
        maxWidth: 500,
        width: '100%',
      }}
    >
      <Typography variant="body1">{children}</Typography>
    </Paper>
  );

  const fetchData = async () => {
    try {
      const [reservationRes, categoriesRes, branchesRes, employeeRes] = await Promise.all([
        apiClient.get('/today_reservations'),
        apiClient.get('/get_categories'),
        apiClient.get('/get_branches'),
        apiClient.post('/employee_detail', {
          employee_id: sessionStorage.getItem('userId')
        }),
      ]);

      setReservations(Array.isArray(reservationRes.data) ? reservationRes.data : []);
      setCategories(categoriesRes.data || []);
      setBranches(branchesRes.data || []);

      const employeeBranchId = employeeRes.data.branch_id;
      const branch = branchesRes.data.find(b => b.branch_id === employeeBranchId);
      setBranchName(branch ? branch.name : 'Sucursal desconocida');

    } catch (error) {
      console.error('Error fetching data', error);
      alert('Error al obtener información. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCancelationPolicy = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    const policyId = category?.cancelation_policy_id;
    return politicas_cancelacion[policyId] || 'No disponible';
  };

  const handleRental = async (reservationId) => {
    try {
      const response = await apiClient.post('/rental', { id: reservationId });
      const {
        message,
        number_plate,
        rental_id,
        category_name,
        category_changed
      } = response.data;

      let alertMessage = message;

      if (number_plate) {
        alertMessage += `. Vehículo asignado: ${number_plate}.`;
      }

      if (category_changed) {
        alertMessage += `\nSe ha asignado una categoría superior debido a stock faltante de la categoría original.`;
      }

      alert(alertMessage);

      if (rental_id) {
        navigate(`/add-packages/${rental_id}`);
      }

      await fetchData();
    } catch (error) {
      console.error('Error al dar de alta el alquiler:', error);
      const msg = error.response?.data?.message || 'Error desconocido al procesar el alquiler.';
      alert(msg);
    }
  };

  const handleAnnulReservation = async (reservation) => {
    try {
      const response = await apiClient.post('/annul_reservation', {
        reservation_id: reservation.reservation_id,
      });

      alert(`${response.data.message}. Reembolso: $${response.data.refund || 0}`);
      setReservations(prev =>
        prev.filter(r => r.reservation_id !== reservation.reservation_id)
      );
    } catch (error) {
      const msg = error.response?.data?.message;

      if (msg && msg.includes('vehículos disponibles')) {
        alert(msg); // NO anula, solo avisa
      } else {
        alert(msg || 'Error al intentar anular la reserva.');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" px={2} pb={6} pt={4}>
      <Card
        sx={{
          width: '100%',
          maxWidth: 800,
          p: 3,
          backgroundColor: theme.palette.beige,
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Sucursal {branchName}
          </Typography>

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Reservas para procesar
          </Typography>

          <Divider sx={{ mb: 3, backgroundColor: theme.palette.charcoal, height: 2 }} />

          <Grid container spacing={2} direction="column">
            {reservations.length > 0 ? (
              reservations.map((reservation, index) => (
                <Grid item key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.beanBlue,
                      color: 'white',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                  >
                    <Typography variant="body1" textAlign="center">
                      Cliente: {reservation.first_name} {reservation.last_name}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Email: {reservation.email}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Categoría del vehículo: {reservation.vehicle_category}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Retiro: {safeFormatDate(reservation.pickup_datetime)}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Devolución: {safeFormatDate(reservation.return_datetime)}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Costo estimado: ${reservation.cost}
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                      Política de cancelación: {getCancelationPolicy(reservation.vehicle_category)}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (window.confirm('¿Confirmás dar de alta este alquiler?')) {
                            handleRental(reservation.reservation_id);
                          }
                        }}
                        sx={{
                          backgroundColor: 'white',
                          color: theme.palette.darkBlue,
                          border: `1px solid ${theme.palette.darkBlue}`,
                          '&:hover': {
                            backgroundColor: theme.palette.grey[100],
                          },
                        }}
                      >
                        Dar de alta alquiler
                      </Button>

                      <Button
                        variant="contained"
                        onClick={() => {
                          if (window.confirm('¿Querés anular esta reserva por falta de disponibilidad?')) {
                            handleAnnulReservation(reservation);
                          }
                        }}
                        sx={{
                          backgroundColor: '#f57c00',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#ef6c00',
                          },
                        }}
                      >
                        Anular reserva
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 150,
                    width: '100%',
                  }}
                >
                  <InfoPaper>No hay reservas activas para dar de alta.</InfoPaper>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RentalRegistration;
