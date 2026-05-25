/** Official vowel data uses cols 6–36; display grid drops the empty leading cols. */
export const VOWEL_COL_OFFSET = 5;
export const VOWEL_DISPLAY_COLS = 36 - VOWEL_COL_OFFSET;
export const VOWEL_GRID_ROWS = 7;

export function vowelDisplayCol(dataCol: number): number {
  return dataCol - VOWEL_COL_OFFSET;
}

export const VOWEL_REGION_COLS = {
  front: '1 / 6',
  central: '13 / 20',
  back: '25 / 31',
} as const;

/** Trapezoid corners in display grid coordinates (matches official proportions, shifted left). */
export const VOWEL_TRAPEZOID = {
  topLeft: { x: 1, y: 0 },
  topRight: { x: 29, y: 0 },
  bottomRight: { x: 29, y: 7 },
  bottomLeft: { x: 13, y: 7 },
} as const;

function trapezoidLeftEdge(y: number): number {
  const { topLeft, bottomLeft } = VOWEL_TRAPEZOID;
  return topLeft.x + ((bottomLeft.x - topLeft.x) * y) / VOWEL_GRID_ROWS;
}

export function renderVowelTrapezoid(): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = VOWEL_TRAPEZOID;
  let horizontals = '';
  for (let row = 1; row < VOWEL_GRID_ROWS; row++) {
    const x1 = trapezoidLeftEdge(row);
    horizontals += `<line x1="${x1}" y1="${row}" x2="${topRight.x}" y2="${row}" />`;
  }

  return `
    <svg class="vowel-trapezoid" viewBox="0 0 ${VOWEL_DISPLAY_COLS} ${VOWEL_GRID_ROWS}" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}" />
      ${horizontals}
    </svg>
  `;
}
