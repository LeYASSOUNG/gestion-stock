'use client'
import { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import { useTenantStore } from '../store/tenantStore'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

        if (token && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            if (parsedUser && typeof parsedUser === 'object') {
              setUser(parsedUser)
              api.defaults.headers.Authorization = `Bearer ${token}`
            } else {
              clearAuth()
            }
          } catch (parseError) {
            clearAuth()
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err)
      } finally {
        setLoading(false)
      }
    }

    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        if (!e.newValue) {
          setUser(null)
          delete api.defaults.headers.Authorization
        } else if (e.key === 'user') {
          try {
            setUser(JSON.parse(e.newValue))
          } catch (err) {
            console.error('Error parsing user data from storage event:', err)
          }
        }
      }
    }

    initializeAuth()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const clearAuth = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    delete api.defaults.headers.Authorization
    setUser(null)
  }

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password })
      // Ensure response structure matches DTO: { token, username, firstName, lastName, role }
      const { token, ...userData } = response.data

      if (!token) throw new Error('No token received')

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      api.defaults.headers.Authorization = `Bearer ${token}`

      setUser(userData)
      
      // Mettre à jour le store du tenant si les infos sont présentes
      if (userData.companyId) {
        useTenantStore.getState().setTenant({
          companyId: userData.companyId,
          companyName: userData.companyName,
          companyType: userData.companyType
        })
      }
      
      toast.success('Connexion réussie')
      return true
    } catch (error) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || error.message || 'Erreur de connexion'
      toast.error(message)
      return false
    }
  }

  const register = async (userData) => {
    try {
      await api.post('/auth/register', userData)
      toast.success('Compte créé avec succès ! Connectez-vous.')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      const message = error.response?.data || error.message || 'Erreur lors de la création du compte'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.Authorization
    setUser(null)
    useTenantStore.getState().clearTenant()
    toast.success('Déconnexion réussie')
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
