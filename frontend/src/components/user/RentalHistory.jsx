import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  useTheme,
  Button,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const politicas_cancelacion = {
  1: "100% de devolución",
  2: "20% de devolución",
  3: "Sin devolución"
};

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
      }}
    >
      <Typography variant="body1">{children}</Typography>
    </Paper>
  );
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

const UserHistory = () => {
  const theme = useTheme();
  const [rentals, setRentals] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalRes, reservationRes, categoriesRes] = await Promise.all([
          apiClient.get('/user_rentals'),
          apiClient.get('/user_reservations'),
          apiClient.get('/get_categories'),
        ]);

        setRentals(rentalRes.data);
        setReservations(reservationRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCancelationPolicy = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    const policyId = category?.cancelation_policy_id;
    return politicas_cancelacion[policyId] || 'No disponible';
  };

const handleCancelReservation = async (reservation) => {
  try {
    // Buscar la categoría correspondiente para obtener la política
    const category = categories.find(cat => cat.name === reservation.vehicle_category);
    const cancelation_policy_id = category?.cancelation_policy_id;

    if (!cancelation_policy_id) {
      alert("No se pudo determinar la política de cancelación para esta reserva.");
      return;
    }

    const response = await apiClient.delete('/cancel_reservation', {
      data: {
        reservation_id: reservation.reservation_id,
        total_cost: reservation.cost,
        cancelation_policy_id: cancelation_policy_id
      }
    });

    setReservations(prev =>
      prev.filter(r => r.reservation_id !== reservation.reservation_id)
    );

    alert(response.data.message);

  } catch (error) {
    console.error('Error cancelando la reserva:', error);
    alert('Error al cancelar la reserva. Por favor, intente nuevamente más tarde.');
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
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      px={2}
      pb={6}
      pt={4}
    >
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
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Historial de Alquileres
          </Typography>
          <Divider
            sx={{
              mb: 3,
              backgroundColor: theme.palette.charcoal,
              height: 2,
            }}
          />

          <Grid container spacing={2} direction="column">
            {rentals.length > 0 ? (
              rentals.map((rental, index) => (
                <Grid item key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.charcoal,
                      color: theme.palette.beige,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" textAlign="center" gutterBottom>
                      {rental.brand_name} {rental.model_name} ({rental.model_year})
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Categoría: {rental.category_name}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Sucursal: {rental.name}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Desde: {safeFormatDate(rental.pickup_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Hasta: {safeFormatDate(rental.return_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Política de cancelación: {getCancelationPolicy(rental.category_name)}
                    </Typography>
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
                  <InfoPaper>No hay alquileres registrados.</InfoPaper>
                </Box>
              </Grid>
            )}
          </Grid>

          <Divider
            sx={{
              my: 4,
              backgroundColor: theme.palette.charcoal,
              height: 2,
            }}
          />

          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Reservas Actuales
          </Typography>

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

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que querés cancelar esta reserva?')) {
                            handleCancelReservation(reservation);
                          }
                        }}
                      >
                        Cancelar reserva
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
                  <InfoPaper>No hay reservas activas.</InfoPaper>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserHistory;
