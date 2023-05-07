export const clamp = (value: number, max: number) => Math.max(0, Math.min(max, value))

export function moveItemInArray<T = any>(
  array: T[],
  fromIndex: number,
  toIndex: number,
): void {
  const from = clamp(fromIndex, array.length - 1)
  const to = clamp(toIndex, array.length - 1)
  if (from === to) {
    return
  }
  const delta = to < from ? -1 : 1

  const target = array[from]

  for (let i = from; i !== to; i += delta) {
    array[i] = array[i + delta]
  }

  array[to] = target
}
