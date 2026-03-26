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

  // Prevent click from bubbling to <th> and accidentally triggering sort
  resizer.addEventListener('click', (e: MouseEvent) => {
    e.stopPropagation()
  })

  resizer.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Lock in the actual rendered width so the first pixel of movement is smooth
    const startWidth = el.offsetWidth
    el.style.width    = `${startWidth}px`
    el.style.minWidth = `${startWidth}px`

    const startX   = e.clientX
    let hasDragged = false

    const onMouseMove = (moveEvent: MouseEvent) => {
      hasDragged = true
      const newWidth = Math.max(MIN_WIDTH, startWidth + moveEvent.clientX - startX)
      el.style.width    = `${newWidth}px`
      el.style.minWidth = `${newWidth}px`
    }

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup',   onMouseUp)
      if (hasDragged) {
        onResize(key, Math.max(MIN_WIDTH, startWidth + upEvent.clientX - startX))
      } else {
        // No drag — revert the locked-in width back to the stored value
        el.style.width    = `${width}px`
        el.style.minWidth = `${width}px`
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup',   onMouseUp)
  })
}
