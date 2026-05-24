import symbolsJson from './symbols.json';
import sectionsJson from './sections.json';
import metaJson from './meta.json';
import type { ChartMeta, IpaSymbol, Section } from '../types';

export const symbols = symbolsJson as IpaSymbol[];
export const sections = sectionsJson as Section[];
export const meta = metaJson as ChartMeta;

const byId = new Map(symbols.map((s) => [s.id, s]));

export function getSymbol(id: number): IpaSymbol | undefined {
  return byId.get(id);
}

export function symbolsBySection(sectionId: string): IpaSymbol[] {
  return symbols.filter((s) => s.section === sectionId);
}

export function isImpossible(col: number, row: number): boolean {
  return meta.impossible.some((c) => c.col === col && c.row === row);
}

/** Official chart hides cols 6–9 except on lateral-fricative row (row 5). */
export function isPulmonicHidden(col: number, row: number): boolean {
  return col >= 6 && col <= 9 && row !== 5;
}
