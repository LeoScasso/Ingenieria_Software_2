import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import apiClient from '../../middleware/axios'

export const Profile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const response = await apiClient.get('/my_profile')
      console.log(response)
      setUser(response.data)
    }
    getUser()
  }, [])

  return (
    <Box>
      <Typography>{user && user.name}</Typography>
    </Box>
  )
}
