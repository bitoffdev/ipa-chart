import { meta, symbolsBySection } from '../data';
import type { IpaSymbol, SectionId } from '../types';
import { escapeHtml } from '../utils/html';
import { renderSymbolButton } from './symbolButton';

function renderSimpleGrid(symbols: IpaSymbol[], cols: number): string {
  const maxRow = Math.max(...symbols.map((s) => s.row), 0);
  const grid = new Map<string, IpaSymbol>();
  for (const s of symbols) grid.set(`${s.col},${s.row}`, s);

  let html = '<div class="simple-grid">';
  for (let row = 1; row <= maxRow; row++) {
    html += '<div class="simple-grid-row">';
    for (let col = 1; col <= cols; col++) {
      const sym = grid.get(`${col},${row}`);
      html += '<div class="simple-grid-cell">';
      if (sym) {
        if (sym.descriptionShort) {
          html += `<div class="cell-with-label">${renderSymbolButton(sym)}<span class="cell-label">${escapeHtml(sym.descriptionShort)}</span></div>`;
        } else {
          html += renderSymbolButton(sym);
        }
      }
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderDiacritics(symbols: IpaSymbol[]): string {
  const diacriticLabels = [
    'Voiceless', 'Breathy voiced', 'Dental',
    'Voiced', 'Creaky voiced', 'Apical',
    'Aspirated', 'Linguolabial', 'Laminal',
    'More rounded', 'Labialized', 'Nasalized',
    'Less rounded', 'Palatalized', 'Nasal release',
    'Advanced', 'Velarized', 'Lateral release',
    'Retracted', 'Pharyngealized', 'No audible release',
    'Centralized', 'Velarized or pharyngealized', '',
    'Mid-centralized', 'Raised', '',
    'Syllabic', 'Lowered', '',
    'Non-syllabic', 'Advanced tongue root', '',
    'Rhoticity', 'Retracted tongue root', '',
  ];

  let html = '<div class="diacritics-grid">';
  symbols.forEach((sym, i) => {
    const label = diacriticLabels[i] ?? '';
    html += `
      <div class="diacritic-item">
        ${renderSymbolButton(sym)}
        <span class="diacritic-name">${escapeHtml(label || sym.description.split(' ').slice(0, 3).join(' '))}</span>
      </div>`;
  });
  html += '</div>';
  return html;
}

function formatLabel(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderPairedRows(symbols: IpaSymbol[]): string {
  let html = '<div class="paired-grid">';
  const byRow = new Map<number, IpaSymbol[]>();
  for (const s of symbols) {
    const list = byRow.get(s.row) ?? [];
    list.push(s);
    byRow.set(s.row, list);
  }
  const rows = [...byRow.keys()].sort((a, b) => a - b);
  for (const row of rows) {
    const rowSyms = byRow.get(row)!.sort((a, b) => a.col - b.col);
    html += '<div class="paired-row">';
    for (const sym of rowSyms) {
      html += `
        <div class="paired-item">
          ${renderSymbolButton(sym)}
          <p class="paired-desc">${escapeHtml(formatLabel(sym.description))}</p>
        </div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderTones(symbols: IpaSymbol[]): string {
  const level = symbols.filter((s) => s.col <= 2 && s.row <= 6);
  const contour = symbols.filter((s) => s.col >= 3 || s.row > 6);

  const renderGroup = (title: string, items: IpaSymbol[]) => {
    let g = `<h3 class="tones-subhead">${title}</h3><div class="tones-group">`;
    const byRow = new Map<number, IpaSymbol[]>();
    for (const s of items) {
      const list = byRow.get(s.row) ?? [];
      list.push(s);
      byRow.set(s.row, list);
    }
    for (const row of [...byRow.keys()].sort((a, b) => a - b)) {
      const rowSyms = byRow.get(row)!.sort((a, b) => a.col - b.col);
      g += '<div class="tones-row">';
      for (const sym of rowSyms) {
        const toneLabel = sym.descriptionShort ?? sym.ipaName;
        g += `
          <div class="tone-item">
            ${renderSymbolButton(sym)}
            <span class="tone-label">${escapeHtml(toneLabel)}</span>
          </div>`;
      }
      g += '</div>';
    }
    g += '</div>';
    return g;
  };

  return renderGroup('Level', level) + renderGroup('Contour', contour);
}

function renderNonPulmonic(symbols: IpaSymbol[]): string {
  let html = '<div class="non-pulmonic-grid">';
  html += '<div class="non-pulmonic-header">';
  for (const air of meta.airstreams) {
    html += `<span>${escapeHtml(air)}</span>`;
  }
  html += '</div>';
  for (let row = 1; row <= 5; row++) {
    html += '<div class="non-pulmonic-row">';
    for (let col = 1; col <= 3; col++) {
      const sym = symbols.find((s) => s.col === col && s.row === row);
      html += '<div class="non-pulmonic-cell">';
      if (sym) {
        if (col === 1 && sym.descriptionShort) {
          html += `<div class="cell-with-label">${renderSymbolButton(sym)}<span class="cell-label">${escapeHtml(sym.descriptionShort)}</span></div>`;
        } else {
          html += renderSymbolButton(sym);
        }
      }
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

export function renderSectionContent(sectionId: SectionId): string {
  const symbols = symbolsBySection(sectionId);
  switch (sectionId) {
    case 'pulmonic':
      return ''; // rendered separately
    case 'non-pulmonic':
      return renderNonPulmonic(symbols);
    case 'other':
      return renderPairedRows(symbols);
    case 'diacritics':
      return renderDiacritics(symbols);
    case 'vowels':
      return ''; // rendered separately
    case 'suprasegmentals':
      return renderPairedRows(symbols);
    case 'tones':
      return renderTones(symbols);
    default:
      return renderSimpleGrid(symbols, 3);
  }
}
