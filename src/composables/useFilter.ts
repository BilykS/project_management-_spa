// GRASP Pure Fabrication: технічний composable без domain-логіки.
// ISP: вузький інтерфейс — тільки фільтрація.
// DRY: один composable для ProjectsTable і TasksTable.
// Open/Closed: розширюється через `fields` конфіг без зміни composable.

import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

// Опис того як фільтрувати кожне поле:
// 'text'  — часткове входження, без урахування регістру
// 'exact' — точний збіг (використовується для статусів)
type FieldMode = 'text' | 'exact'

type FilterFields<T> = Partial<Record<keyof T, FieldMode>>

export function useFilter<T extends Record<string, unknown>>(
  items: Ref<T[]> | ComputedRef<T[]>,
  filters: Ref<Partial<Record<keyof T, string>>>,
  fields: FilterFields<T>,
) {
  const filtered = computed<T[]>(() =>
    items.value.filter((item) =>
      (Object.entries(fields) as [keyof T, FieldMode][]).every(
        ([field, mode]) => {
          const filterVal = filters.value[field]

          // Порожній фільтр = показати все
          if (!filterVal) return true

          const itemVal = String(item[field] ?? '')

          return mode === 'text'
            ? itemVal.toLowerCase().includes(filterVal.toLowerCase())
            : itemVal === filterVal
        },
      ),
    ),
  )

  return { filtered }
}
