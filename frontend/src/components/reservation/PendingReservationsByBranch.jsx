import React, { useEffect, useState } from 'react';
import {
  Select,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import apiClient from '../../middleware/axios';

const PendingReservationsByBranch = () => {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoadingBranches(true);
    apiClient
      .get('/get_branches')
      .then((res) => {
        setBranches(res.data);
        setLoadingBranches(false);
      })
      .catch(() => {
        setError('Error al cargar sucursales');
        setLoadingBranches(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedBranch) {
      setReservations([]);
      return;
    }

    setLoadingReservations(true);
    apiClient
      .get('/get_pending_reservations_by_branch', {
        params: { branch_id: selectedBranch },
      })
      .then((res) => {
        setReservations(res.data);
        setLoadingReservations(false);
      })
      .catch(() => {
        setError('Error al cargar reservas pendientes');
        setLoadingReservations(false);
      });
  }, [selectedBranch]);

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Seleccioná una sucursal
      </Typography>

      {loadingBranches ? (
        <CircularProgress />
      ) : (
        <Select
          fullWidth
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            setError(null);
          }}
          displayEmpty
          sx={{ mb: 3 }}
        >
          <MenuItem value="" disabled>
            -- Elegir sucursal --
          </MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.branch_id} value={branch.branch_id}>
              {branch.name} ({branch.locality})
            </MenuItem>
          ))}
        </Select>
      )}

      <Typography variant="h6" gutterBottom>
        Reservas pendientes
      </Typography>

      {loadingReservations ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : reservations.length === 0 ? (
        <Typography>No hay reservas pendientes para esta sucursal.</Typography>
      ) : (
        <List>
          {reservations.map((res) => (
            <ListItem key={res.reservation_id} divider>
              <ListItemText
                primary={`Reserva #${res.reservation_id} — Vehículo: ${
                  res.plate || 'Sin asignar'
                }`}
                secondary={`Pickup: ${new Date(res.pickup_datetime).toLocaleDateString()} - Devolución: ${new Date(
                  res.return_datetime
                ).toLocaleDateString()}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default PendingReservationsByBranch;
