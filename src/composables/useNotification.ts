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
