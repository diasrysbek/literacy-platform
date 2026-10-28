import axios from 'axios'
import { useStore } from '@/app/store'

// Адрес сервера задаётся переменной VITE_API_URL (например, https://my-api.up.railway.app,
// без слеша на конце и без /api). В разработке по умолчанию — http://localhost:5000.
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')

if (!BASE_URL && !import.meta.env.DEV) {
  console.error('VITE_API_URL не задан: клиент не знает, где находится сервер. См. DEPLOY.md')
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Запросы входа/регистрации могут законно вернуть 401/409 — это не «сессия истекла»,
// ошибку должна показать сама форма (раньше страница перезагружалась и текст ошибки пропадал).
const isAuthRequest = (url = '') => /\/auth\/(login|register)/.test(url)

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      // чистим и localStorage-токен, и сохранённое состояние zustand,
      // иначе ProtectedRoute продолжит считать пользователя вошедшим
      useStore.getState().logout()
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
