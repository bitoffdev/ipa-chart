import { isImpossible, isPulmonicHidden, meta, symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';
import { renderSymbolButton } from './symbolButton';

const COLS = 22;
const ROWS = 8;

function cellAt(grid: Map<string, IpaSymbol>, col: number, row: number): IpaSymbol | undefined {
  return grid.get(`${col},${row}`);
}

export function renderPulmonicChart(): string {
  const symbols = symbolsBySection('pulmonic');
  const grid = new Map<string, IpaSymbol>();
  for (const s of symbols) grid.set(`${s.col},${s.row}`, s);

  let head = '<tr><th scope="col" class="pulmonic-corner"></th>';
  for (let p = 0; p < meta.places.length; p++) {
    head += `<th scope="col" colspan="2" class="pulmonic-place">${meta.places[p]}</th>`;
  }
  head += '</tr>';

  let body = '';
  for (let row = 1; row <= ROWS; row++) {
    body += `<tr><th scope="row" class="pulmonic-manner">${meta.manners[row - 1]}</th>`;
    for (let col = 1; col <= COLS; col++) {
      if (isPulmonicHidden(col, row)) {
        body += '<td class="pulmonic-cell pulmonic-hidden" aria-hidden="true"></td>';
        continue;
      }
      const sym = cellAt(grid, col, row);
      const impossible = isImpossible(col, row);
      const classes = ['pulmonic-cell'];
      if (impossible) classes.push('pulmonic-impossible');
      if (!sym && !impossible) classes.push('pulmonic-empty');

      if (sym) {
        body += `<td class="${classes.join(' ')}">${renderSymbolButton(sym)}</td>`;
      } else if (impossible) {
        body += `<td class="${classes.join(' ')}"></td>`;
      } else {
        body += `<td class="${classes.join(' ')}"></td>`;
      }
    }
    body += '</tr>';
  }

  return `
    <div class="pulmonic-scroll">
      <table class="pulmonic-table">
        <thead>${head}</thead>
        <tbody>${body}</tbody>
      </table>
    </div>
    <p class="chart-legend">Symbols to the right in a pair are voiced, to the left are voiceless. Shaded cells denote articulations judged impossible.</p>
  `;
}
