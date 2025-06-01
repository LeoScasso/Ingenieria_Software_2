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
          apiClient.get('/get_categories'), // acá traemos las categorías con las políticas
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

  // Función para obtener la política según el nombre de la categoría
  const getCancelationPolicy = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.cancelation_policy || 'No disponible';
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
                    <Typography variant="h6" textAlign="center" gutterBottom>
                      Reserva #{reservation.reservation_id}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Categoría del vehículo: {reservation.vehicle_category}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Retiro: {safeFormatDate(reservation.pickup_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Devolución: {safeFormatDate(reservation.return_datetime)}
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      Costo estimado: ${reservation.cost}
                    </Typography>

                    <Typography variant="body2" textAlign="center" sx={{ mt: 1, fontStyle: 'italic' }}>
                      Política de cancelación: {getCancelationPolicy(reservation.vehicle_category)}
                    </Typography>

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                          console.log(`Cancelar reserva ${reservation.reservation_id}`);
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
