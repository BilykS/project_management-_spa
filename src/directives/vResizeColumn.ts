import type { Directive, DirectiveBinding } from 'vue'

export interface ResizeColumnBinding {
  key: string
  width: number
  onResize: (key: string, width: number) => void
}

const MIN_WIDTH = 40

export const vResizeColumn: Directive<HTMLElement, ResizeColumnBinding> = {
  mounted(el, binding: DirectiveBinding<ResizeColumnBinding>) {
    applyResizer(el, binding.value)
  },

  updated(el, binding: DirectiveBinding<ResizeColumnBinding>) {
    const existingResizer = el.querySelector('.col-resizer')
    if (!existingResizer) {
      applyResizer(el, binding.value)
      return
    }
    if (binding.value.width !== binding.oldValue?.width) {
      el.style.width    = `${binding.value.width}px`
      el.style.minWidth = `${binding.value.width}px`
    }
  },

  beforeUnmount(el) {
    el.querySelector('.col-resizer')?.remove()
  },
}

function applyResizer(
  el: HTMLElement,
  { key, width, onResize }: ResizeColumnBinding,
): void {
  el.style.width      = `${width}px`
  el.style.minWidth   = `${width}px`
  el.style.position   = 'relative'
  el.style.userSelect = 'none'

  if (el.querySelector('.col-resizer')) return

  const resizer = document.createElement('div')
  resizer.className = 'col-resizer'
  Object.assign(resizer.style, {
    position:   'absolute',
    top:        '0',
    right:      '0',
    width:      '6px',
    height:     '100%',
    cursor:     'col-resize',
    userSelect: 'none',
    zIndex:     '1',
  })

  el.appendChild(resizer)

  resizer.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startX     = e.clientX
    const startWidth = el.offsetWidth

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX)
      el.style.width    = `${newWidth}px`
      el.style.minWidth = `${newWidth}px`
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
      onResize(key, Math.max(MIN_WIDTH, startWidth + upEvent.clientX - startX))
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
  })
}
