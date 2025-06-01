import { useEffect, useState } from 'react'
import apiClient from '../../middleware/axios'

export const Vehicles = () => {
  const [vehicles, setVehicles] = useState([])

  const getVehicles = async () => {
    const response = await apiClient.get('/get_vehicles')
    setVehicles(response.data)
  }

  useEffect(() => {
    getVehicles()
    console.log(vehicles)
  }, [])
  return (
    <div>
      {vehicles.map((vehicle) => (
        <div key={vehicle.id}>
          <h2>{vehicle.name}</h2>
          <p>{vehicle.description}</p>
        </div>
      ))}
    </div>
  )
}
