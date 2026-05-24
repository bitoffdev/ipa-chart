import { symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';
import { renderSymbolButton } from './symbolButton';

const MAX_COL = 36;
const MAX_ROW = 7;

export function renderVowelChart(): string {
  const symbols = symbolsBySection('vowels');
  const byPos = new Map<string, IpaSymbol>();
  for (const s of symbols) byPos.set(`${s.col},${s.row}`, s);

  let cells = '';
  for (const sym of symbols) {
    cells += `<div class="vowel-cell" style="grid-column:${sym.col};grid-row:${sym.row}">${renderSymbolButton(sym)}</div>`;
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
          ${cells}
        </div>
      </div>
    </div>
    <p class="chart-legend">Where symbols appear in pairs, the one to the right represents a rounded vowel. Left to right: tongue position from front to back. Top to bottom: close to open mouth.</p>
  `;
}
