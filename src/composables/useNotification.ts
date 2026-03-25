// GRASP Pure Fabrication: обгортка над vue-toastification.
// GRASP Protected Variations: компоненти і stores залежать від цього
// інтерфейсу, а не від vue-toastification напряму — зміна бібліотеки
// торкнеться тільки цього файлу.
// ISP: вузький інтерфейс — тільки сповіщення.

import { useToast } from 'vue-toastification'

export function useNotification() {
  const toast = useToast()

  return {
    success: (message: string) => toast.success(message),
    error:   (message: string) => toast.error(message),
    info:    (message: string) => toast.info(message),
    warning: (message: string) => toast.warning(message),
  }
}
