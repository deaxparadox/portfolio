const WEIGHTS = [0.35, 0.25, 0.2, 0.12, 0.08]

export function generateHeatmapCells(count: number): number[] {
  return Array.from({ length: count }, () => {
    let acc = 0
    const r = Math.random()
    for (let j = 0; j < WEIGHTS.length; j++) {
      acc += WEIGHTS[j]
      if (r < acc) return j
    }
    return 0
  })
}
