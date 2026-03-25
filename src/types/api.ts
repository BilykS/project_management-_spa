// Типи для роботи з API шаром.
// json-server повертає дані напряму (без обгортки),
// тому ApiResponse використовується для внутрішньої типізації Axios.

import type { AxiosResponse } from 'axios'

// Typed alias для Axios response — компоненти і stores отримують T напряму
export type ApiResponse<T> = AxiosResponse<T>

// Структура помилки яку може повернути сервер
export interface ApiError {
  message: string
  statusCode?: number
  errors?: Record<string, string[]>
}
