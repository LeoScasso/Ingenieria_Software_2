import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import apiClient from '../../middleware/axios'
import { theme } from '../../theme/theme'

const FleetSection = () => {
  const [categories, setCategories] = useState([])

  const getCategories = async () => {
    const response = await apiClient.get('/categories')
    console.log(response.data)
    setCategories(response.data)
  }

  const getCategoryImage = (category) => {
    switch (category) {
      case 'SUV':
        return './car-suv.svg'
      case 'Apto discapacitados':
        return './disabledBadge.webp'
      case 'Chico':
        return './smallCar.jpg'
      case 'Van':
        return './van.png'
      case 'Deportivo':
        return './sportCar.jpg'
      case 'Mediano':
        return './mediumCar.jpg'
      default:
        return './logoAlquilapp.png'
    }
  }

  useEffect(() => {
    getCategories()
  }, [])

  return (
    <Box sx={{ backgroundColor: theme.palette.slateGray, py: 6, px: 4 }}>
      <Typography
        variant="h5"
        sx={{ color: 'white', mb: 4, textAlign: 'center' }}
      >
        Nuestra flota de alquiler de vehículos
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {categories.map((category, index) => (
          <Grid item key={index} xs={12} md={4}>
            <Card sx={{ backgroundColor: '#324151', color: 'white' }}>
              <CardMedia
                component="img"
                image={getCategoryImage(category)}
                alt={category}
                sx={{
                  height: 160,
                  objectFit: 'contain',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  p: 2
                }}
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {category}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default FleetSection
