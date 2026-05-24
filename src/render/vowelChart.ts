import { symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';
import { renderSymbolButton } from './symbolButton';

const MAX_COL = 36;
const MAX_ROW = 7;

/** Trapezoid corners in grid coordinates (matches official vowel chart proportions). */
const TRAPEZOID = {
  topLeft: { x: 6, y: 0 },
  topRight: { x: 34, y: 0 },
  bottomRight: { x: 34, y: 7 },
  bottomLeft: { x: 18, y: 7 },
} as const;

function trapezoidLeftEdge(y: number): number {
  const { topLeft, bottomLeft } = TRAPEZOID;
  return topLeft.x + ((bottomLeft.x - topLeft.x) * y) / MAX_ROW;
}

function renderVowelTrapezoid(): string {
  const { topLeft, topRight, bottomRight, bottomLeft } = TRAPEZOID;
  let horizontals = '';
  for (let row = 1; row < MAX_ROW; row++) {
    const x1 = trapezoidLeftEdge(row);
    horizontals += `<line x1="${x1}" y1="${row}" x2="${topRight.x}" y2="${row}" />`;
  }

  return `
    <svg class="vowel-trapezoid" viewBox="0 0 ${MAX_COL} ${MAX_ROW}" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}" />
      ${horizontals}
    </svg>
  `;
}

function isVowelPair(unrounded: IpaSymbol, rounded: IpaSymbol): boolean {
  return (
    unrounded.row === rounded.row &&
    rounded.col - unrounded.col <= 4 &&
    unrounded.description.includes('UNROUNDED') &&
    rounded.description.includes('ROUNDED')
  );
}

export function renderVowelChart(): string {
  const symbols = symbolsBySection('vowels');
  const sorted = [...symbols].sort((a, b) => a.row - b.row || a.col - b.col);

  let cells = '';
  for (let i = 0; i < sorted.length; i++) {
    const sym = sorted[i];
    const next = sorted[i + 1];
    if (next && isVowelPair(sym, next)) {
      cells += `<div class="vowel-pair" style="grid-column:${sym.col};grid-row:${sym.row}">${renderSymbolButton(sym)}${renderSymbolButton(next)}</div>`;
      i++;
    } else {
      cells += `<div class="vowel-cell" style="grid-column:${sym.col};grid-row:${sym.row}">${renderSymbolButton(sym)}</div>`;
    }
  }

  const frontCols = '6 / 11';
  const centralCols = '18 / 25';
  const backCols = '30 / 36';

  return `
    <div class="vowel-chart-wrap">
      <div class="vowel-axis vowel-axis-y" aria-hidden="true">
        <span class="vowel-axis-label vowel-axis-top">close</span>
        <span class="vowel-axis-arrow">↑</span>
        <span class="vowel-axis-mid">mouth</span>
        <span class="vowel-axis-arrow">↓</span>
        <span class="vowel-axis-label vowel-axis-bottom">open</span>
      </div>
      <div class="vowel-main">
        <div class="vowel-axis vowel-axis-x" aria-hidden="true">
          <span>front</span>
          <span class="vowel-axis-arrow">→</span>
          <span>tongue</span>
          <span class="vowel-axis-arrow">→</span>
          <span>back</span>
        </div>
        <div class="vowel-regions" aria-hidden="true">
          <span style="grid-column:${frontCols}">Front</span>
          <span style="grid-column:${centralCols}">Central</span>
          <span style="grid-column:${backCols}">Back</span>
        </div>
        <div class="vowel-grid" style="--vowel-cols:${MAX_COL};--vowel-rows:${MAX_ROW}">
          ${renderVowelTrapezoid()}
          ${cells}
        </div>
      </div>
    </div>
    <p class="chart-legend">Where symbols appear in pairs, the one to the right represents a rounded vowel. Left to right: tongue position from front to back. Top to bottom: close to open mouth.</p>
  `;
}
