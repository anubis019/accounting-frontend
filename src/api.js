import axios from 'axios'

export const API_HOST =
  import.meta.env.VITE_API_URL ||
  'https://accounting-backend-production-e5e6.up.railway.app'

const api = axios.create({
  baseURL: `${API_HOST}/api`,
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
