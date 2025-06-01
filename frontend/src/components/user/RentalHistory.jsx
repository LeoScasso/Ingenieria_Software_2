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
      }}
    >
      <Typography variant="body1">{children}</Typography>
    </Paper>
  );
};

// 🧠 Nueva función para formatear fechas sin hora y evitar invalid dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return 'Fecha inválida';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentalRes, reservationRes] = await Promise.all([
          apiClient.get('/user_rentals'),
          apiClient.get('/user_reservations'),
        ]);
        console.log("RESERVATIONS RESPONSE", reservationRes.data);
        console.log("RENTALS RESPONSE", rentalRes.data);

        setRentals(rentalRes.data);
        setReservations(reservationRes.data);
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

          <Grid container spacing={2}>
            {rentals.length > 0 ? (
              rentals.map((rental, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.charcoal,
                      color: theme.palette.beige,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" textAlign="center" gutterBottom>
                      {rental.brand_name} {rental.model_name} (
                      {rental.model_year})
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Categoría: {rental.category_name}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Sucursal: {rental.name}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Desde: {formatDate(rental.pickup_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Hasta: {formatDate(rental.return_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Política de cancelación:{' '}
                      {rental.cancelation_policy_name}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
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

          <Grid container spacing={2}>
            {reservations.length > 0 ? (
              reservations.map((reservation, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: theme.palette.beanBlue,
                      color: 'white',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="h6" textAlign="center" gutterBottom>
                      Reserva #{reservation.reservation_id}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Categoría del vehículo: {reservation.vehicle_category}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Retiro: {formatDate(reservation.pickup_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Devolución: {formatDate(reservation.return_datetime)}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
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
