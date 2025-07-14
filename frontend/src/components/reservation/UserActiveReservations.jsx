import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Alert,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const politicas_cancelacion = {
  1: '100% de reembolso',
  2: '20% de reembolso',
  3: 'Sin reembolso',
};

const UserActiveReservations = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [reservations, setReservations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/get_categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setReservations([]);
    setSearched(false);

    try {
      const response = await apiClient.post('/user_reservations_for_employee', { email });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filtered = response.data.filter((r) => {
        const pickup = new Date(r.pickup_datetime);
        return pickup >= today;
      });

      setReservations(filtered);
      setSearched(true);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Error al obtener reservas.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return 'No disponible';
    const date = new Date(iso);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCancelationPolicy = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    const policyId = category?.cancelation_policy_id;
    return politicas_cancelacion[policyId] || 'No disponible';
  };

  const handleCancelReservation = async (reservation) => {
    if (!window.confirm('¿Estás seguro que querés cancelar esta reserva?')) return;

    try {
      const category = categories.find(cat => cat.name === reservation.vehicle_category);
      const cancelation_policy_id = category?.cancelation_policy_id;

      if (!cancelation_policy_id) {
        alert("No se pudo determinar la política de cancelación para esta reserva.");
        return;
      }

      const payload = {
        reservation_id: reservation.reservation_id,
        cost: reservation.cost,
        cancelation_policy_id,
      };

      const response = await apiClient.delete('/cancel_reservation', { data: payload });

      alert(response.data.message || 'Reserva cancelada con éxito');

      setReservations((prev) =>
        prev.filter((r) => r.reservation_id !== reservation.reservation_id)
      );
    } catch (err) {
      console.error('Error al cancelar la reserva:', err);
      const msg = err.response?.data?.message || 'Error al cancelar la reserva';
      alert(msg);
    }
  };

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
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Consulta de reservas activas por usuario
          </Typography>

          <Divider sx={{ mb: 3, backgroundColor: theme.palette.charcoal, height: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Email del usuario"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading || !email}
            >
              Buscar
            </Button>
          </Box>

          {loading && (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {searched && reservations.length === 0 && !error && (
            <Box display="flex" justifyContent="center">
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
                <Typography variant="body1">
                  No hay reservas activas para este usuario.
                </Typography>
              </Paper>
            </Box>
          )}

          <Grid container spacing={2} direction="column">
            {reservations.map((res, index) => (
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
                    Reserva #{res.reservation_id}
                  </Typography>
                  <Divider sx={{ mb: 2, backgroundColor: 'white' }} />
                  <Typography textAlign="center"><strong>Categoría:</strong> {res.vehicle_category}</Typography>
                  <Typography textAlign="center"><strong>Retiro:</strong> {formatDate(res.pickup_datetime)}</Typography>
                  <Typography textAlign="center"><strong>Devolución:</strong> {formatDate(res.return_datetime)}</Typography>
                  <Typography textAlign="center"><strong>Costo:</strong> ${res.cost}</Typography>
                  <Typography textAlign="center">
                    <strong>Política de cancelación:</strong>{' '}
                    {getCancelationPolicy(res.vehicle_category)}
                  </Typography>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleCancelReservation(res)}
                    >
                      Cancelar reserva
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserActiveReservations;
