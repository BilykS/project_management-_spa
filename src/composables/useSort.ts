import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { SortState } from '@/types/models'

export function useSort<T extends Record<string, unknown>>(
  items: Ref<T[]> | ComputedRef<T[]>,
  sortState: Ref<SortState>,
) {
  const sorted = computed<T[]>(() => {
    const { key, direction } = sortState.value

    return [...items.value].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      // null/undefined always at end
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let cmp = 0

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }

      return direction === 'asc' ? cmp : -cmp
    })
  })

  return { sorted }
}
