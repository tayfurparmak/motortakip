export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
}

export const useToast = () => {
  const toasts = useState<Toast[]>('app_toasts', () => [])

  const add = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = { ...toast, id }
    toasts.value.push(newToast)

    setTimeout(() => {
      remove(id)
    }, 4000)
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (title: string, message?: string) => {
    add({ type: 'success', title, message })
  }

  const error = (title: string, message?: string) => {
    add({ type: 'error', title, message })
  }

  const warning = (title: string, message?: string) => {
    add({ type: 'warning', title, message })
  }

  const info = (title: string, message?: string) => {
    add({ type: 'info', title, message })
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    warning,
    info
  }
}

