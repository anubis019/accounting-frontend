import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext'

const PrivateRoute = () => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading AcctSys...</p>
        </div>
      </div>
    )
  }
  
  return user ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute