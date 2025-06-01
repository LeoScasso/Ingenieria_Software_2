import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your backend API base
  withCredentials: true,
})

export default apiClient
