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

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, token } = useStore.getState()
  if (!token) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}

export const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  { path: '/dashboard', element: <ProtectedRoute requiredRole="PARENT"><Dashboard /></ProtectedRoute> },
  { path: '/progress/:childId', element: <ProtectedRoute requiredRole="PARENT"><Progress /></ProtectedRoute> },
  { path: '/notifications', element: <ProtectedRoute requiredRole="PARENT"><Notifications /></ProtectedRoute> },

  { path: '/play', element: <ProtectedRoute><ChildSelect /></ProtectedRoute> },
  { path: '/play/:childId/map', element: <ProtectedRoute><Map /></ProtectedRoute> },
  { path: '/play/:childId/lesson/:lessonId', element: <ProtectedRoute><Lesson /></ProtectedRoute> },
  { path: '/play/:childId/result/:lessonId', element: <ProtectedRoute><Result /></ProtectedRoute> },
  { path: '/leaderboard', element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },

  { path: '/admin', element: <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute> },
  { path: '/admin/curriculum', element: <ProtectedRoute requiredRole="ADMIN"><CurriculumManager /></ProtectedRoute> },
])
