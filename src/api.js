import axios from 'axios'

export const API_HOST =
  import.meta.env.VITE_API_URL ||
  'https://accounting-backend-production-2ded.up.railway.app/api'

const api = axios.create({
  baseURL: API_HOST,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api
