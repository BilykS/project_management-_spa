import { computed } from 'vue'
import { useUiStore } from '@/stores/ui.store'
import type { ResizeColumnBinding } from '@/directives/vResizeColumn'

type TableKey = 'project' | 'task'

export function useResizableColumns(tableKey: TableKey) {
  const uiStore = useUiStore()

  const widths = computed(() =>
    tableKey === 'project'
      ? uiStore.projectColumnWidths
      : uiStore.taskColumnWidths,
  )

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
