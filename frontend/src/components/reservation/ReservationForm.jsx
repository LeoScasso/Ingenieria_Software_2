import React, { useState, useEffect } from 'react';
import { Typography, Stack, Button } from '@mui/material';
import apiClient from '../../middleware/axios';
import Form from '../common/Form';
import { useNavigate } from 'react-router-dom';

const ReservationForm = () => {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem('role');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    ...(userRole === 'employee' && { email: '' }),
    pickup_datetime: '',
    return_datetime: '',
    category: '',
    pickup_branch: '',
    return_branch: '',
  });

  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [rentalDays, setRentalDays] = useState(0);

  const requiredFields = userRole === 'employee'
    ? ['email', 'pickup_datetime', 'return_datetime', 'category', 'pickup_branch', 'return_branch']
    : ['pickup_datetime', 'return_datetime', 'category', 'pickup_branch', 'return_branch'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const { pickup_datetime, return_datetime, category } = formData;
    if (pickup_datetime && return_datetime && category) {
      const pickupDate = new Date(pickup_datetime);
      const returnDate = new Date(return_datetime);
      const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
      const categoryObj = categories.find(c => c.category_id === parseInt(category));

      if (pickupDate > returnDate) {
        setTotalCost(null);
        setRentalDays(0);
        return;
      }

      if (categoryObj && days > 0) {
        setRentalDays(days);
        setTotalCost(days * categoryObj.price_per_day);
      } else {
        setRentalDays(0);
        setTotalCost(null);
      }
    } else {
      setRentalDays(0);
      setTotalCost(null);
    }
  }, [formData.pickup_datetime, formData.return_datetime, formData.category, categories]);

  const handleSubmit = async (method) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (requiredFields.some(field => !formData[field])) {
        alert('Por favor complete todos los campos obligatorios');
        setIsSubmitting(false);
        return;
      }

      const pickupDate = new Date(formData.pickup_datetime);
      const returnDate = new Date(formData.return_datetime);
      const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
      const categoryObj = categories.find(c => c.category_id === parseInt(formData.category));

      if (pickupDate > returnDate) {
        alert('La fecha de retiro no puede ser posterior a la fecha de devolución');
        setIsSubmitting(false);
        return;
      }

      if (categoryObj && days < categoryObj.minimum_rental_days) {
        alert(`Debe alquilar al menos ${categoryObj.minimum_rental_days} día(s) para la categoría seleccionada`);
        setIsSubmitting(false);
        return;
      }

      if (userRole === 'employee') {
        navigate('/reserve-detail', {
          state: {
            ...formData,
            totalCost,
            rentalDays,
          },
        });
        return;
      } else {
        navigate(`/payment/${method}`, {
          state: {
            ...formData,
            totalCost
          }
        });
      }

    } catch (err) {
      console.error('Error:', err);
      const errorMsg = err?.response?.data?.error || 'Error interno del servidor';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, branchesRes] = await Promise.all([
          apiClient.get('/get_categories'),
          apiClient.get('/get_branches')
        ]);
        setCategories(categoriesRes.data);
        setBranches(branchesRes.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };
    loadData();
  }, []);

  const baseFields = [
    {
      name: 'pickup_datetime',
      label: 'Fecha de retiro',
      type: 'date',
      value: formData.pickup_datetime,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'return_datetime',
      label: 'Fecha de devolución',
      type: 'date',
      value: formData.return_datetime,
      onChange: handleChange,
      required: true,
    },
    {
      name: 'category',
      label: 'Categoría',
      type: 'select',
      value: formData.category,
      onChange: handleChange,
      required: true,
      options: categories.map(cat => ({
        value: cat.category_id,
        label: `${cat.name} - $${cat.price_per_day}/día - ${cat.minimum_rental_days} día(s) mínimo`,
      })),
    },
    {
      name: 'pickup_branch',
      label: 'Sucursal de retiro',
      type: 'select',
      value: formData.pickup_branch,
      onChange: handleChange,
      required: true,
      options: branches.map(branch => ({
        value: branch.name,
        label: `${branch.name} - ${branch.address}`,
      })),
    },
    {
      name: 'return_branch',
      label: 'Sucursal de devolución',
      type: 'select',
      value: formData.return_branch,
      onChange: handleChange,
      required: true,
      options: branches.map(branch => ({
        value: branch.name,
        label: `${branch.name} - ${branch.address}`,
      })),
    },
  ];

  const fields = userRole === 'employee'
    ? [
        {
          name: 'email',
          label: 'Email del cliente',
          type: 'text',
          value: formData.email,
          onChange: handleChange,
          required: true,
        },
        ...baseFields,
      ]
    : baseFields;

  return (
    <Form title="Reservar Vehículo" fields={fields}>
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
        {totalCost !== null ? `Costo estimado: $${totalCost}` : 'Complete los datos para ver el costo'}
      </Typography>

      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
        {userRole === 'employee' ? (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSubmit(null)}
            disabled={isSubmitting}
          >
            Continuar Reserva
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              onClick={() => handleSubmit('card')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Pagar con Tarjeta'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleSubmit('wallet')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : 'Pagar con Billetera'}
            </Button>
          </>
        )}
      </Stack>
    </Form>
  );
};

export default ReservationForm;
