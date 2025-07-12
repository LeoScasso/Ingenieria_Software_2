import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const formatDateLong = (dateString) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', options);
};

const ReservationDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const reservationData = location.state;

  if (!reservationData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.darkBlue,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" color={theme.palette.beige}>
          No hay datos de reserva disponibles.
        </Typography>
      </Box>
    );
  }

  const {
    email,
    pickup_datetime,
    return_datetime,
    category,
    pickup_branch,
    return_branch,
    totalCost,
    rentalDays,
  } = reservationData;

  const handleConfirm = async () => {
    try {
      const payload = {
        email,
        pickup_datetime,
        return_datetime,
        category,
        pickup_branch,
        return_branch,
        cost: totalCost,
      };

      const response = await apiClient.post('/reserve', payload);
      alert(response.data.message || 'Reserva confirmada con éxito');
      navigate('/');
    } catch (err) {
      console.error('Error al confirmar reserva:', err);
      alert('Ocurrió un error al confirmar la reserva');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.darkBlue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          backgroundColor: theme.palette.slateGray,
          borderRadius: 2,
          maxWidth: 600,
          width: '100%',
        }}
      >
        <Typography
          variant="h5"
          gutterBottom
          sx={{ color: theme.palette.beige, textAlign: 'center' }}
        >
            Detalle de Reserva
        </Typography>

        <Divider sx={{ my: 2, borderColor: theme.palette.ming }} />

        <Box sx={{ color: theme.palette.beige }}>
          {email && (
            <Typography>
              <strong>Email cliente:</strong> {email}
            </Typography>
          )}
          <Typography>
            <strong>Fecha de retiro:</strong> {formatDateLong(pickup_datetime)}
          </Typography>
          <Typography>
            <strong>Fecha de devolución:</strong> {formatDateLong(return_datetime)}
          </Typography>
          <Typography>
            <strong>Sucursal de retiro:</strong> {pickup_branch}
          </Typography>
          <Typography>
            <strong>Sucursal de devolución:</strong> {return_branch}
          </Typography>
          <Typography>
            <strong>Días de alquiler:</strong> {rentalDays}
          </Typography>
          <Typography>
            <strong>Costo estimado:</strong> ${totalCost}
          </Typography>
        </Box>

        <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 4 }}>
            <Button
            variant="outlined"
            onClick={() => navigate('/reservation', { state: reservationData })}
            sx={{
                borderColor: theme.palette.ming,
                color: theme.palette.beige,
                '&:hover': {
                borderColor: theme.palette.beige,
                backgroundColor: theme.palette.ming,
                },
            }}
            >
            Volver
            </Button>
            <Button
                variant="contained"
                color="primary"
                onClick={handleConfirm}
                sx={{
                backgroundColor: theme.palette.beanBlue,
                color: theme.palette.beige,
                '&:hover': {
                    backgroundColor: theme.palette.ming,
                },
                }}
            >
                Confirmar Reserva
            </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ReservationDetail;
