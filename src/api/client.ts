// SRP: цей модуль відповідає тільки за створення та конфігурацію HTTP-клієнта.
// DIP: всі API модулі залежать від цього клієнта, а не від axios напряму.

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import { useToast } from 'vue-toastification'

// ─── Створення інстансу ───────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request interceptor ──────────────────────────────────────────────────────
// KISS: тільки dev-логування — нічого зайвого

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (import.meta.env.DEV) {
      console.log(`[API] → ${config.method?.toUpperCase()} ${config.url}`)
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ─── Response interceptor ─────────────────────────────────────────────────────
// SRP: глобальна обробка HTTP-помилок живе тут, а не розкидана по stores

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (import.meta.env.DEV) {
      console.log(`[API] ← ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error: AxiosError<{ message?: string }>) => {
    // useToast() викликається всередині interceptor — це безпечно
    // оскільки Vue app вже змонтована на момент першого запиту
    const toast = useToast()

    const status = error.response?.status
    const serverMessage = error.response?.data?.message

    const errorMessages: Record<number, string> = {
      400: serverMessage ?? 'Bad request.',
      404: 'Resource not found.',
      500: 'Server error. Please try again later.',
    }

    const message =
      (status && errorMessages[status]) ??
      serverMessage ??
      error.message ??
      'An unexpected error occurred.'

    toast.error(message)

    if (import.meta.env.DEV) {
      console.error(`[API] ✕ ${status ?? 'Network error'}:`, message)
    }

    return Promise.reject(error)
  },
)

export default apiClient
