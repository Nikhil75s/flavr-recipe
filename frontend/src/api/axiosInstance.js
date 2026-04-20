/**
 * api/axiosInstance.js — Pre-configured Axios instance for API communication.
 */

import axios from 'axios'

// Create an Axios instance with the base URL pointing to the backend API
const API = axios.create({
  baseURL: '/api', // In dev, Vite proxies /api → http://localhost:5000/api
})

interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flavr_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // Attach JWT token
    }
    return config
  },
  (error) => Promise.reject(error)
)


API.interceptors.response.use(
  (response) => response, // Pass through successful responses unchanged
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('flavr_token') // Clear the expired/invalid token
      // Redirect to login page only if not already on it (prevents redirect loop)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default API
