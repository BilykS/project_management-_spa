import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

// Accepts both Ref and ComputedRef (both have .value)
type ReadonlyRef<T> = Ref<T> | ComputedRef<T> | { readonly value: T }

type FieldMode = 'text' | 'exact'
type FilterFields<T> = Partial<Record<keyof T, FieldMode>>

export function useFilter<T extends Record<string, unknown>>(
  items: ReadonlyRef<T[]>,
  filters: ReadonlyRef<Record<string, string>>,
  fields: FilterFields<T>,
) {
  const filtered = computed<T[]>(() =>
    items.value.filter((item) =>
      (Object.entries(fields) as [keyof T, FieldMode][]).every(
        ([field, mode]) => {
          const filterVal = filters.value[field as string]
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
