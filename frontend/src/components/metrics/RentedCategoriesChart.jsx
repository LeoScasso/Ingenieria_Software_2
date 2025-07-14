import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import apiClient from '../../middleware/axios';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const RentedVehiclesChart = () => {
  const theme = useTheme();
  const [firstDate, setFirstDate] = useState('');
  const [secondDate, setSecondDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [rentedData, setRentedData] = useState(null);
  const [error, setError] = useState('');

  const fetchRentedVehicles = async () => {
    setLoading(true);
    setError('');
    setRentedData(null);

    try {
      const res = await apiClient.post('/rented_vehicles', {
        first_date: firstDate,
        second_date: secondDate,
      });

      if (res.data.message) {
        setError(res.data.message);
        return;
      }

      setRentedData(res.data);
    } catch (err) {
      setError('Error al obtener datos de vehículos alquilados');
    } finally {
      setLoading(false);
    }
  };

  const barColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  return (
    <Paper
      sx={{
        p: 3,
        pb: 6,
        maxWidth: 900,
        mx: 'auto',
        mt: 4,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        backgroundColor: '#f5f0e6',
      }}
      elevation={4}
    >
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        Vehículos Alquilados por Categoría
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TextField
          label="Fecha desde"
          type="date"
          value={firstDate}
          onChange={(e) => setFirstDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <TextField
          label="Fecha hasta"
          type="date"
          value={secondDate}
          onChange={(e) => setSecondDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 150 }}
        />
        <Button
          variant="contained"
          onClick={fetchRentedVehicles}
          disabled={!firstDate || !secondDate || loading}
          sx={{ height: 40 }}
        >
          Consultar
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {rentedData && rentedData.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay vehículos alquilados para el rango de fechas seleccionado.
        </Alert>
      )}

      {rentedData && rentedData.length > 0 && (
        <>
          <Box
            sx={{
              width: '85%',
              maxWidth: '480px',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Bar
              data={{
                labels: rentedData.map((item) => item.categoria),
                datasets: [
                  {
                    label: '',
                    data: rentedData.map((item) => item.total),
                    backgroundColor: rentedData.map(
                      (_, idx) => barColors[idx % barColors.length]
                    ),
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: { font: { size: 12 } },
                  },
                  title: {
                    display: true,
                    text: 'Vehículos alquilados por categoría',
                    color: theme.palette.text.primary,
                    font: { weight: 'bold', size: 18 },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const value = context.raw || 0;
                        return `Total: ${value}`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: theme.palette.text.secondary,
                      stepSize: 1,
                      precision: 0,
                    },
                    grid: { color: theme.palette.divider },
                  },
                  x: {
                    ticks: { color: theme.palette.text.secondary },
                    grid: { color: theme.palette.divider },
                  },
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small" aria-label="tabla vehículos alquilados">
              <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Alquilados</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentedData.map((item, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>{item.categoria}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default RentedVehiclesChart;
