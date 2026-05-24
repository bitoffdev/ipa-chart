import type { IpaSymbol } from '../types';
import { escapeHtml } from '../utils/html';

export function renderSymbolButton(sym: IpaSymbol, extraClass = ''): string {
  const label = sym.symbol || ' ';
  return `<button type="button" class="sym-btn ${extraClass}" data-symbol-id="${sym.id}" aria-label="${escapeHtml(sym.description)}">${escapeHtml(label)}</button>`;
}
