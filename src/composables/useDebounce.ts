export function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay = 400,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer !== null) clearTimeout(timer)
    timer = setTimeout(() => { fn(...args) }, delay)
  }
}
