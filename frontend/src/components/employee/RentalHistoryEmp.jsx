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
  Chip,
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
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const EmployeeRentals = () => {
  const theme = useTheme();
  const [rentals, setRentals] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get employee details to know the branch
        const employeeResponse = await apiClient.post('/employee_detail', {
          employee_id: sessionStorage.getItem('user_id')
        });
        
        if (!employeeResponse.data) {
          throw new Error('No se pudo obtener la información del empleado');
        }
        
        setBranchName(employeeResponse.data.name);
        
        // 2. Get all branches
        const branchesResponse = await apiClient.get('/get_branches');
        setBranches(branchesResponse.data || []);
        
        // 3. Get all rentals for the branch
        const rentalsResponse = await apiClient.get('/rentals_for_pickup_branch');
        
        if (rentalsResponse.data && !rentalsResponse.data.message) {
          setRentals(rentalsResponse.data);
        } else {
          setRentals([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRentalStatus = (rental) => {
    // Since the endpoint only returns active rentals (condition_id == 2)
    return { text: 'Activo', color: 'success' };
  };

  const getReturnBranchInfo = (branchId) => {
    if (!branchId) return { name: 'No especificada', address: '' };
    
    const branch = branches.find(b => b.branch_id === branchId);
    return branch ? 
      { name: branch.name, address: branch.address } : 
      { name: 'Sucursal no encontrada', address: '' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <InfoPaper>{error}</InfoPaper>
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
          maxWidth: 1000,
          p: 3,
          backgroundColor: theme.palette.beige,
          borderRadius: 4,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={theme.palette.darkBlue}
            gutterBottom
          >
            Alquileres Activos - Sucursal {branchName}
          </Typography>
          <Divider
            sx={{
              mb: 3,
              backgroundColor: theme.palette.charcoal,
              height: 2,
            }}
          />

          <Grid container spacing={3}>
            {rentals.length > 0 ? (
              rentals.map((rental, index) => {
                const status = getRentalStatus(rental);
                const returnBranch = getReturnBranchInfo(rental.branch_id_return);
                
                return (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        backgroundColor: theme.palette.charcoal,
                        color: theme.palette.beige,
                        borderRadius: 2,
                        height: '100%',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6" fontWeight="bold">
                          {rental.name} {/* Category name */}
                        </Typography>
                        <Chip
                          label={status.text}
                          color={status.color}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        <strong>Patente:</strong> {rental.number_plate}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Categoría:</strong> {rental.name}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Cliente:</strong> {rental.email}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Teléfono:</strong> {rental.phone_number}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Retiro:</strong> {safeFormatDate(rental.pickup_datetime)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Devolución estimada:</strong> {safeFormatDate(rental.return_datetime)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Devolución en:</strong> {returnBranch.name} - {returnBranch.address}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Costo total:</strong> ${rental.final_cost}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })
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
                  <InfoPaper>No hay alquileres activos en esta sucursal.</InfoPaper>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeRentals;