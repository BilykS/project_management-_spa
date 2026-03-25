// GRASP Indirection: посередник між директивою vResizeColumn і ui.store.
// Директива не знає про store — вона отримує callback.
// Компонент не знає про деталі resize — він отримує готовий binding.
// DRY: не дублюємо логіку читання/запису ширин у кожному компоненті.

import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'
import type { ResizeColumnBinding } from '@/directives/vResizeColumn'

type TableKey = 'project' | 'task'

export function useResizableColumns(tableKey: TableKey) {
  const uiStore = useUiStore()

  // Information Expert: ui.store знає ширини → він їх повертає
  const widths = computed(() =>
    tableKey === 'project'
      ? uiStore.projectColumnWidths
      : uiStore.taskColumnWidths,
  )

  // Повертає binding-об'єкт для директиви v-resize-column
  // Open/Closed: додавання нової колонки — тільки нове поле в ui.store
  function getBinding(colKey: string): ResizeColumnBinding {
    return {
      key:   colKey,
      width: widths.value[colKey] ?? 120,
      onResize(key: string, width: number) {
        if (tableKey === 'project') {
          uiStore.setProjectColumnWidth(key, width)
        } else {
          uiStore.setTaskColumnWidth(key, width)
        }
      },
    }
  }

  return { widths, getBinding }
}
