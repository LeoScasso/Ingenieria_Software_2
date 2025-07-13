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
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import apiClient from '../../middleware/axios';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const IncomeChart = () => {
  const theme = useTheme();
  const [firstDate, setFirstDate] = useState('');
  const [secondDate, setSecondDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [incomeData, setIncomeData] = useState(null);
  const [error, setError] = useState('');

  const fetchIncome = async () => {
    setLoading(true);
    setError('');
    setIncomeData(null);

    try {
      const res = await apiClient.post('/income', {
        first_date: firstDate,
        second_date: secondDate,
      });

      if (res.data.message) {
        setError(res.data.message);
        return;
      }

      setIncomeData(res.data);
    } catch (err) {
      setError('Error al obtener los ingresos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  const total =
    incomeData?.reduce((acc, curr) => acc + parseFloat(curr.category_income || 0), 0) || 0;

  // Paleta extendida con colores únicos para categorías comunes
  const getCategoryColor = (categoryName) => {
    const colorMap = {
      'cancelados': theme.palette.error.main,
      'apto discapacitados': '#8e44ad', // violeta
      'regular': theme.palette.success.main,
      'promocional': theme.palette.warning.main,
      'otros': theme.palette.info.main,
      'deportivo': '#3498db', // azul brillante
      'sub': '#2c3e50', // azul oscuro
    };

    // Si la categoría está en el mapa, devuelve su color específico
    const lowerCaseName = categoryName.toLowerCase();
    if (colorMap[lowerCaseName]) {
      return colorMap[lowerCaseName];
    }

    // Para categorías no mapeadas, usa una paleta rotativa
    const defaultPalette = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      '#2ecc71', // verde claro
      '#e67e22', // naranja
      '#34495e', // azul grisáceo
      '#16a085', // verde turquesa
      '#c0392b', // rojo oscuro
      '#7f8c8d', // gris
      '#f39c12', // amarillo oscuro
      '#d35400', // naranja oscuro
    ];

    // Hash simple para asignar colores consistentes a categorías no mapeadas
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return defaultPalette[Math.abs(hash) % defaultPalette.length];
  };

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
        Ingresos por Categoría
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
          onClick={fetchIncome}
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

      {incomeData && (
        <>
          <Pie
            data={{
              labels: incomeData.map((i) => i.name),
              datasets: [
                {
                  label: 'Ingresos',
                  data: incomeData.map((i) => i.category_income),
                  backgroundColor: incomeData.map((i) => getCategoryColor(i.name)),
                  borderColor: theme.palette.background.paper,
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  color: theme.palette.text.primary,
                  font: { weight: 'bold', size: 18 },
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw || 0;
                      const percentage = ((value / total) * 100).toFixed(2);
                      return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    },
                  },
                },
              },
            }}
          />

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" sx={{ mb: 2 }} color={theme.palette.text.primary}>
            Ingreso total: <b>{formatCurrency(total)}</b>
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350 }}>
            <Table stickyHeader size="small" aria-label="tabla ingresos">
              <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Categoría</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Ingreso</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Porcentaje</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incomeData.map((i, idx) => {
                  const percentage = ((i.category_income / total) * 100).toFixed(2);
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>{i.name}</TableCell>
                      <TableCell>{formatCurrency(i.category_income)}</TableCell>
                      <TableCell>{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default IncomeChart;