import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import apiClient from '../../middleware/axios'; // 💥 NO TE OLVIDES DE ESTA IMPORTACIÓN

const HeaderCell = ({ children }) => (
  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
    {children}
  </TableCell>
);

const BodyCell = ({ children }) => {
  const theme = useTheme();
  return (
    <TableCell
      sx={{
        color: theme.palette.charcoal,
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1rem',
      }}
    >
      {children}
    </TableCell>
  );
};

const getPolicyColor = (policyName, theme) => {
  switch (policyName?.toLowerCase()) {
    case 'sin devolucion':
      return { backgroundColor: theme.palette.darkBlue, color: theme.palette.beige };
    case '20% de devolucion':
      return { backgroundColor: theme.palette.ming, color: theme.palette.beige };
    case '100% de devolucion':
      return { backgroundColor: `${theme.palette.charcoal}90`, color: 'white' };
    default:
      return { backgroundColor: 'white', color: 'black' };
  }
};

export const EmployeeMaintenanceVehicles = () => {
  const theme = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [userBranchId, setUserBranchId] = useState(null);
  const [branchName, setBranchName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [employeeRes, vehiclesRes, branchesRes] = await Promise.all([
        apiClient.post('/employee_detail', {
          employee_id: sessionStorage.getItem('userId'),
        }),
        apiClient.get('/get_vehicles'),
        apiClient.get('/get_branches'),
      ]);

      const branchId = employeeRes.data.branch_id;
      setUserBranchId(branchId);

      const branches = branchesRes.data || [];
      const branch = branches.find((b) => b.branch_id === branchId);
      setBranchName(branch ? branch.name : 'Sucursal desconocida');

      const allVehicles = vehiclesRes.data || [];

      const maintenanceVehicles = allVehicles.filter(
        (v) => v.condition_id === 3 && v.branch_id === branchId
      );

      setVehicles(maintenanceVehicles);
    } catch (error) {
      if (error.response) {
        console.error('Respuesta del servidor con error:', error.response.data);
      } else {
        console.error('Error sin respuesta del servidor:', error.message);
      }
      alert('Error al obtener los datos, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoDisponible = async (vehicle_id) => {
    try {
      const res = await apiClient.post('/change_vehicle_to_available', { vehicle_id });
      alert(res.data.message);
      fetchData();
    } catch (error) {
      console.error('Error cambiando estado:', error);
      alert('No se pudo cambiar el estado del vehículo');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography sx={{ mr: 2, color: theme.palette.charcoal }}>Cargando vehículos...</Typography>
        <CircularProgress />
      </Box>
    );
  }

    return (
    <Box sx={{ padding: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper
        elevation={3}
        sx={{
            backgroundColor: theme.palette.beige,
            padding: 3,
            boxShadow: `0 4px 8px ${theme.palette.slateGray}40`,
            width: '100%',
            maxWidth: 1200,
        }}
        >
        <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            color="white"
            mb={2}
            sx={{
            backgroundColor: theme.palette.charcoal,
            padding: 2,
            borderRadius: 1,
            }}
        >
            Vehículos en mantenimiento - Sucursal: {branchName}
        </Typography>

        {vehicles.length === 0 ? (
            <Box
            sx={{
                padding: 4,
                textAlign: 'center',
            }}
            >
            <Typography
                sx={{
                color: theme.palette.charcoal,
                fontWeight: 'bold',
                fontSize: '1.2rem',
                }}
            >
                No hay vehículos en mantenimiento en tu sucursal.
            </Typography>
            </Box>
        ) : (
            <TableContainer
            component={Box}
            sx={{
                maxHeight: '60vh',
                overflow: 'auto',
            }}
            >
            <Table>
                <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.charcoal }}>
                    <HeaderCell>Patente</HeaderCell>
                    <HeaderCell>Marca</HeaderCell>
                    <HeaderCell>Modelo</HeaderCell>
                    <HeaderCell>Año</HeaderCell>
                    <HeaderCell>Categoría</HeaderCell>
                    <HeaderCell>Precio/Día</HeaderCell>
                    <HeaderCell>Capacidad</HeaderCell>
                    <HeaderCell>Días mín. alq.</HeaderCell>
                    <HeaderCell>Política de cancelación</HeaderCell>
                    <HeaderCell>Acciones</HeaderCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {vehicles.map((vehicle) => (
                    <TableRow
                    key={vehicle.vehicle_id}
                    sx={{
                        backgroundColor: theme.palette.beige,
                        '&:hover': { backgroundColor: `${theme.palette.beanBlue}30` },
                    }}
                    >
                    <BodyCell>{vehicle.number_plate}</BodyCell>
                    <BodyCell>{vehicle.brand}</BodyCell>
                    <BodyCell>{vehicle.model}</BodyCell>
                    <BodyCell>{vehicle.year}</BodyCell>
                    <BodyCell>{vehicle.category}</BodyCell>
                    <BodyCell>{vehicle.price_per_day}</BodyCell>
                    <BodyCell>{vehicle.max_capacity}</BodyCell>
                    <BodyCell>{vehicle.minimum_rental_days}</BodyCell>
                    <BodyCell>
                        <Chip
                        label={vehicle.name}
                        sx={{
                            ...getPolicyColor(vehicle.name, theme),
                            fontWeight: 'bold',
                            fontSize: '0.875rem',
                        }}
                        />
                    </BodyCell>
                    <BodyCell>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => marcarComoDisponible(vehicle.vehicle_id)}
                        title="Marcar como disponible"
                        sx={{ minWidth: 0, padding: '6px' }}
                    >
                        <CheckCircleOutlineIcon />
                    </Button>
                    </BodyCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </TableContainer>
        )}
        </Paper>
    </Box>
    );
};
