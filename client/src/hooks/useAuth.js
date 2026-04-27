import { useStore } from '@/app/store'
import { useNavigate } from 'react-router-dom'
import api from '@/services/api'

export const useAuth = () => {
  const { user, token, setAuth, logout } = useStore()
  const navigate = useNavigate()

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setAuth(res.data.user, res.data.token)
    const role = res.data.user.role
    navigate(role === 'ADMIN' ? '/admin' : '/dashboard')
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    setAuth(res.data.user, res.data.token)
    navigate('/dashboard')
    return res.data
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
    isParent: user?.role === 'PARENT',
    login,
    register,
    logout: handleLogout,
  }
}