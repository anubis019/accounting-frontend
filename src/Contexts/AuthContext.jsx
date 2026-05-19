import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../api'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser(decoded)
      } catch (e) {
        localStorage.removeItem('token')
        setToken(null)
      }
    }
    setLoading(false)
  }, [token])

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password })
      const { access_token, user: userData } = response.data
      
      localStorage.setItem('token', access_token)
      setToken(access_token)
      setUser(userData)
      
      toast.success('Login successful!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed')
      return false
    }
  }

  const register = async (userData) => {
    try {
      await api.post('/register', userData)
      toast.success('Registration successful! Please check your email.')
      return true
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}