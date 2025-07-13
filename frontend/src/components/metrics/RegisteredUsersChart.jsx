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
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import apiClient from '../../middleware/axios';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const groupByDate = (users) => {
  const map = {};
  users.forEach((user) => {
    const date = user.registration_date;
    map[date] = (map[date] || 0) + 1;
  });
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const RegisteredUsersChart = () => {
  const theme = useTheme();
  const [firstDate, setFirstDate] = useState('');
  const [secondDate, setSecondDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setChartData(null);

    try {
      const res = await apiClient.post('/registered', {
        first_date: firstDate,
        second_date: secondDate,
      });

      if (res.data.message) {
        setError(res.data.message);
        setUsers([]);
        return;
      }

      const userList = res.data;
      setUsers(userList);

      const grouped = groupByDate(userList);
      const labels = grouped.map((g) => g.date);
      const counts = grouped.map((g) => g.count);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Usuarios registrados',
            data: counts,
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
            tension: 0.3,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      });
    } catch (err) {
      setError('Error al obtener los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        pb: 6, // padding bottom extra para separar del footer
        maxWidth: 900,
        mx: 'auto',
        mt: 4,
        borderRadius: 2,
        boxShadow: theme.shadows[3],
        backgroundColor: '#f5f0e6', // beige clarito, cálido y suave
      }}
      elevation={4}
    >
      <Typography variant="h5" gutterBottom color="primary" fontWeight="bold">
        Usuarios Registrados
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
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
          onClick={fetchData}
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

      {chartData && (
        <>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  text: 'Registros por día',
                  color: theme.palette.text.primary,
                  font: { weight: 'bold', size: 18 },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  stepSize: 1,
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

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{ mb: 2 }}
            color={theme.palette.text.primary}
          >
            Total de registros: <b>{users.length}</b>
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small" aria-label="usuarios registrados">
              <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Apellido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.user_id} hover>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.last_name}</TableCell>
                    <TableCell>{formatDate(u.registration_date)}</TableCell>
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

export default RegisteredUsersChart;
