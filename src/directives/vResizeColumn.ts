// GRASP Pure Fabrication: директива не є domain-об'єктом — технічний
// інструмент для resize поведінки.
// GRASP Protected Variations: компоненти використовують директиву,
// не знаючи про механіку mousedown/mousemove/mouseup.
// SRP: тільки логіка resize — зберігання ширини через callback.
// Open/Closed: будь-який <th> може отримати resize поведінку
// без зміни директиви.

import type { Directive, DirectiveBinding } from 'vue'

export interface ResizeColumnBinding {
  // ключ колонки — передається у callback
  key: string
  // початкова ширина (px)
  width: number
  // викликається при завершенні resize
  onResize: (key: string, width: number) => void
}

// Мінімальна ширина колонки (px) — захист від колапсу
const MIN_WIDTH = 40

export const vResizeColumn: Directive<HTMLElement, ResizeColumnBinding> = {
  mounted(el, binding: DirectiveBinding<ResizeColumnBinding>) {
    applyResizer(el, binding.value)
  },

  updated(el, binding: DirectiveBinding<ResizeColumnBinding>) {
    // Оновлюємо ширину колонки якщо вона зміниласьззовні (напр. з persist)
    const existingResizer = el.querySelector('.col-resizer')
    if (!existingResizer) {
      applyResizer(el, binding.value)
      return
    }
    // Якщо ширина змінилась зовні — застосовуємо
    if (binding.value.width !== binding.oldValue?.width) {
      el.style.width  = `${binding.value.width}px`
      el.style.minWidth = `${binding.value.width}px`
    }
  },

  beforeUnmount(el) {
    const resizer = el.querySelector('.col-resizer')
    resizer?.remove()
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyResizer(
  el: HTMLElement,
  { key, width, onResize }: ResizeColumnBinding,
): void {
  // Встановлюємо початкову ширину
  el.style.width    = `${width}px`
  el.style.minWidth = `${width}px`
  el.style.position = 'relative'
  el.style.userSelect = 'none'

  // Запобігаємо дублюванню resizer-ів
  if (el.querySelector('.col-resizer')) return

  const resizer = document.createElement('div')
  resizer.className = 'col-resizer'
  Object.assign(resizer.style, {
    position:    'absolute',
    top:         '0',
    right:       '0',
    width:       '6px',
    height:      '100%',
    cursor:      'col-resize',
    userSelect:  'none',
    zIndex:      '1',
  })

  el.appendChild(resizer)

  resizer.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startX      = e.clientX
    const startWidth  = el.offsetWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta    = moveEvent.clientX - startX
      const newWidth = Math.max(MIN_WIDTH, startWidth + delta)
      el.style.width    = `${newWidth}px`
      el.style.minWidth = `${newWidth}px`
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)

      const delta    = upEvent.clientX - startX
      const newWidth = Math.max(MIN_WIDTH, startWidth + delta)
      // Зберігаємо фінальну ширину через callback → ui.store
      onResize(key, newWidth)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
  })
}
