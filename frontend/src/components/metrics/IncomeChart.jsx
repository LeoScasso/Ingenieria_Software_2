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

  const getCategoryColors = (categories) => {
    const colorMap = {
      'apto discapacitados': '#8e44ad',
      'chico': '#3498db',
      'deportivo': '#e74c3c',
      'suv': '#f39c12',
      'van': '#16a085',
      'medio': '#2ecc71',
      'cancelado': '#7f8c8d',
    };

    const result = {};
    categories.forEach(category => {
      const normalizedName = category.toLowerCase().trim();
      if (colorMap[normalizedName]) {
        result[category] = colorMap[normalizedName];
      }
    });

    const backupPalette = [
      '#1abc9c', '#d35400', '#34495e', '#9b59b6',
      '#e67e22', '#2c3e50', '#f1c40f', '#c0392b'
    ];

    let backupIndex = 0;
    categories.forEach(category => {
      if (!result[category]) {
        result[category] = backupPalette[backupIndex % backupPalette.length];
        backupIndex++;
      }
    });

    return result;
  };

  const categoryColors = incomeData ? getCategoryColors(incomeData.map(i => i.name)) : {};

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

      {incomeData && total === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay datos de ingresos para el rango de fechas seleccionado.
        </Alert>
      )}

      {incomeData && total > 0 && (
        <>
          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
              height: '400px',
              mx: 'auto',
              mb: 3,
              position: 'relative',
            }}
          >
            <Pie
              data={{
                labels: incomeData.map((i) => i.name),
                datasets: [
                  {
                    label: 'Ingresos',
                    data: incomeData.map((i) => i.category_income),
                    backgroundColor: incomeData.map((i) => categoryColors[i.name]),
                    borderColor: theme.palette.background.paper,
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      boxWidth: 15,
                      padding: 12,
                      font: {
                        size: 13,
                        family: theme.typography.fontFamily,
                      },
                      usePointStyle: true,
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const percentage = ((value / total) * 100).toFixed(2);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                      },
                    },
                    bodyFont: {
                      size: 13,
                      family: theme.typography.fontFamily,
                    },
                  },
                },
                cutout: '60%',
                animation: {
                  animateScale: true,
                  animateRotate: true,
                },
              }}
            />
          </Box>

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
                      <TableCell sx={{ color: categoryColors[i.name] }}>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-block',
                            width: 12,
                            height: 12,
                            backgroundColor: categoryColors[i.name],
                            mr: 1,
                            borderRadius: '50%',
                          }}
                        />
                        {i.name}
                      </TableCell>
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
