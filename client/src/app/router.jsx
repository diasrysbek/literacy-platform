import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useStore } from '@/app/store'

import Landing from '@/features/auth/pages/Landing'
import Login from '@/features/auth/pages/Login'
import Register from '@/features/auth/pages/Register'

import Dashboard from '@/features/parent/pages/Dashboard'
import Progress from '@/features/parent/pages/Progress'
import Notifications from '@/features/parent/pages/Notifications'

import ChildSelect from '@/features/child/pages/ChildSelect'
import Map from '@/features/child/pages/Map'
import Lesson from '@/features/child/pages/Lesson'
import Result from '@/features/child/pages/Result'
import Leaderboard from '@/features/child/pages/Leaderboard'

import AdminDashboard from '@/features/admin/pages/AdminDashboard'
import CurriculumManager from '@/features/admin/pages/CurriculumManager'

const homeFor = (role) => (role === 'ADMIN' ? '/admin' : '/dashboard')

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useStore.getState()
  if (!token) return <Navigate to="/login" replace />
  // Раньше при неверной роли редирект всегда вёл на /dashboard — для администратора это
  // был бесконечный цикл (/dashboard → /dashboard). Теперь каждый попадает на свою главную.
  if (requiredRole && user?.role !== requiredRole) return <Navigate to={homeFor(user?.role)} replace />
  return children
}

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  { path: '/dashboard', element: <ProtectedRoute requiredRole="PARENT"><Dashboard /></ProtectedRoute> },
  { path: '/progress/:childId', element: <ProtectedRoute requiredRole="PARENT"><Progress /></ProtectedRoute> },
  { path: '/notifications', element: <ProtectedRoute requiredRole="PARENT"><Notifications /></ProtectedRoute> },

  { path: '/play', element: <ProtectedRoute requiredRole="PARENT"><ChildSelect /></ProtectedRoute> },
  { path: '/play/:childId/map', element: <ProtectedRoute requiredRole="PARENT"><Map /></ProtectedRoute> },
  { path: '/play/:childId/lesson/:lessonId', element: <ProtectedRoute requiredRole="PARENT"><Lesson /></ProtectedRoute> },
  { path: '/play/:childId/result/:lessonId', element: <ProtectedRoute requiredRole="PARENT"><Result /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },

  { path: '/admin', element: <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute> },
  { path: '/admin/curriculum', element: <ProtectedRoute requiredRole="ADMIN"><CurriculumManager /></ProtectedRoute> },

  // неизвестный адрес — на главную, а не пустой экран
  { path: '*', element: <Navigate to="/" replace /> },
])
