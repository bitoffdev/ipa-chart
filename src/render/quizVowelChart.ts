import type { IpaSymbol } from '../types';
import { escapeHtml } from '../utils/html';
import {
  VOWEL_DISPLAY_COLS,
  VOWEL_GRID_ROWS,
  VOWEL_REGION_COLS,
  renderVowelTrapezoid,
  vowelDisplayCol,
} from './vowelChartLayout';

function isVowelPair(unrounded: IpaSymbol, rounded: IpaSymbol): boolean {
  return (
    unrounded.row === rounded.row &&
    rounded.col - unrounded.col <= 4 &&
    unrounded.description.includes('UNROUNDED') &&
    rounded.description.includes('ROUNDED')
  );
}

function renderAnswerButton(sym: IpaSymbol, playable: boolean): string {
  if (!playable) {
    return `<span class="quiz-answer-btn quiz-answer-btn--missing" aria-hidden="true">${escapeHtml(sym.symbol || ' ')}</span>`;
  }
  return `<button type="button" class="quiz-answer-btn ipa-text" data-symbol-id="${sym.id}" aria-label="${escapeHtml(sym.description)}">${escapeHtml(sym.symbol || ' ')}</button>`;
}

export function renderQuizVowelChart(vowels: IpaSymbol[], playableIds: Set<number>): string {
  const sorted = [...vowels].sort((a, b) => a.row - b.row || a.col - b.col);

  let cells = '';
  for (let i = 0; i < sorted.length; i++) {
    const sym = sorted[i];
    const next = sorted[i + 1];
    const col = vowelDisplayCol(sym.col);
    const row = sym.row;
    if (next && isVowelPair(sym, next)) {
      cells += `<div class="vowel-pair" style="grid-column:${col};grid-row:${row}">${renderAnswerButton(sym, playableIds.has(sym.id))}${renderAnswerButton(next, playableIds.has(next.id))}</div>`;
      i++;
    } else {
      cells += `<div class="vowel-cell" style="grid-column:${col};grid-row:${row}">${renderAnswerButton(sym, playableIds.has(sym.id))}</div>`;
    }
  }

  const { front, central, back } = VOWEL_REGION_COLS;

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
          <span style="grid-column:${front}">Front</span>
          <span style="grid-column:${central}">Central</span>
          <span style="grid-column:${back}">Back</span>
        </div>
        <div class="vowel-grid" style="--vowel-cols:${VOWEL_DISPLAY_COLS};--vowel-rows:${VOWEL_GRID_ROWS}">
          ${renderVowelTrapezoid()}
          ${cells}
        </div>
      </div>
    </div>
  `;
}
