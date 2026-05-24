import { symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';

/** 0 = close … 6 = open */
export type Openness = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 0 = front … 4 = back */
export type Frontness = 0 | 1 | 2 | 3 | 4;

/** 0 = unrounded, 1 = rounded; null when the chart does not mark rounding */
export type Rounding = 0 | 1 | null;

export interface VowelAxes {
  openness: Openness;
  frontness: Frontness;
  rounding: Rounding;
}

export interface AxisDelta {
  openness: number;
  frontness: number;
  rounding: number | null;
}

/** Unrounded + rounded partners share the same chart height and frontness. */
const CHART_VOWEL_PAIRS: [string, string][] = [
  ['i', 'y'],
  ['ɨ', 'ʉ'],
  ['ɯ', 'u'],
  ['ɪ', 'ʏ'],
  ['e', 'ø'],
  ['ɘ', 'ɵ'],
  ['ɤ', 'o'],
  ['ɛ', 'œ'],
  ['ɜ', 'ɞ'],
  ['ʌ', 'ɔ'],
  ['a', 'ɶ'],
  ['ɑ', 'ɒ'],
];

export const OPENNESS_LABELS = ['close', 'near-close', 'close-mid', 'mid', 'open-mid', 'near-open', 'open'] as const;
export const FRONTNESS_LABELS = ['front', 'near-front', 'central', 'near-back', 'back'] as const;
export const ROUNDING_BUCKETS = ['unrounded', 'rounded', 'not distinguished'] as const;

export type OpennessLabel = (typeof OPENNESS_LABELS)[number];
export type FrontnessLabel = (typeof FRONTNESS_LABELS)[number];
export type RoundingBucket = (typeof ROUNDING_BUCKETS)[number];

export interface VowelAxisBuckets {
  openness: OpennessLabel;
  frontness: FrontnessLabel;
  rounding: RoundingBucket;
}

export function vowelAxisBuckets(sym: IpaSymbol): VowelAxisBuckets {
  const axes = vowelAxes(sym);
  return {
    openness: OPENNESS_LABELS[axes.openness],
    frontness: FRONTNESS_LABELS[axes.frontness],
    rounding:
      axes.rounding === 0
        ? 'unrounded'
        : axes.rounding === 1
          ? 'rounded'
          : 'not distinguished',
  };
}

type VowelPosition = Pick<VowelAxes, 'openness' | 'frontness'>;

function parseOpenness(desc: string, row: number): Openness {
  if (desc.includes('NEAR-OPEN')) return 5;
  if (desc.includes('OPEN-MID')) return 4;
  if (desc.includes('CLOSE-MID')) return 2;
  if (desc.includes('NEAR-CLOSE')) return 1;
  if (desc.includes('MID')) return 3;
  if (desc.includes('OPEN')) return 6;
  if (desc.includes('CLOSE')) return 0;
  return Math.min(6, Math.max(0, row - 1)) as Openness;
}

function parseFrontness(desc: string): Frontness {
  if (desc.includes('NEAR-FRONT')) return 1;
  if (desc.includes('NEAR-BACK')) return 3;
  if (desc.includes('CENTRAL')) return 2;
  if (desc.includes('FRONT')) return 0;
  if (desc.includes('BACK')) return 4;
  return 2;
}

function parseRounding(desc: string): Rounding {
  if (desc.includes('UNROUNDED')) return 0;
  if (desc.includes('ROUNDED')) return 1;
  return null;
}

function buildPairPositions(): Map<string, VowelPosition> {
  const vowels = symbolsBySection('vowels');
  const bySymbol = new Map(vowels.map((v) => [v.symbol, v]));
  const positions = new Map<string, VowelPosition>();

  for (const [unrounded, rounded] of CHART_VOWEL_PAIRS) {
    const sym = bySymbol.get(unrounded);
    if (!sym) continue;

    const position = {
      openness: parseOpenness(sym.description, sym.row),
      frontness: parseFrontness(sym.description),
    };
    positions.set(unrounded, position);
    positions.set(rounded, position);
  }

  return positions;
}

const PAIR_POSITIONS = buildPairPositions();

export function vowelAxes(sym: IpaSymbol): VowelAxes {
  const paired = PAIR_POSITIONS.get(sym.symbol);
  const rounding = parseRounding(sym.description);

  if (paired) {
    return { ...paired, rounding };
  }

  return {
    openness: parseOpenness(sym.description, sym.row),
    frontness: parseFrontness(sym.description),
    rounding,
  };
}

export function compareVowelAxes(guess: VowelAxes, correct: VowelAxes): AxisDelta {
  return {
    openness: guess.openness - correct.openness,
    frontness: guess.frontness - correct.frontness,
    rounding:
      guess.rounding !== null && correct.rounding !== null
        ? guess.rounding - correct.rounding
        : null,
  };
}

function axisPhrase(steps: number, oneStep: string, multiStep: (n: number) => string): string | null {
  if (steps === 0) return null;
  const abs = Math.abs(steps);
  if (abs === 1) return oneStep;
  return multiStep(abs);
}

function opennessPhrase(delta: number): string | null {
  if (delta > 0) {
    return axisPhrase(delta, 'more open', (n) => `${n} steps more open`);
  }
  return axisPhrase(delta, 'more close', (n) => `${n} steps more close`);
}

function frontnessPhrase(delta: number): string | null {
  if (delta > 0) {
    return axisPhrase(delta, 'farther back', (n) => `${n} steps farther back`);
  }
  return axisPhrase(delta, 'farther front', (n) => `${n} steps farther front`);
}

function roundingPhrase(delta: number): string | null {
  if (delta > 0) {
    return axisPhrase(delta, 'more rounded', (n) => `${n} steps more rounded`);
  }
  return axisPhrase(delta, 'more unrounded', (n) => `${n} steps more unrounded`);
}

export function formatWrongGuessFeedback(
  guessSym: IpaSymbol,
  correctSym: IpaSymbol,
): { main: string; detail: string | null; answerAxes: string } {
  const delta = compareVowelAxes(vowelAxes(guessSym), vowelAxes(correctSym));
  const parts: string[] = [];

  const openness = opennessPhrase(delta.openness);
  if (openness) parts.push(openness);

  const frontness = frontnessPhrase(delta.frontness);
  if (frontness) parts.push(frontness);

  if (delta.rounding !== null) {
    const rounding = roundingPhrase(delta.rounding);
    if (rounding) parts.push(rounding);
  }

  const detail = parts.length > 0 ? `Your guess was ${parts.join(', ')}.` : null;

  return {
    main: `Not quite — that was /${correctSym.symbol}/`,
    detail,
    answerAxes: formatAxisSummary(correctSym),
  };
}

export function formatAxisSummary(sym: IpaSymbol): string {
  const axes = vowelAxes(sym);
  const parts: string[] = [OPENNESS_LABELS[axes.openness], FRONTNESS_LABELS[axes.frontness]];
  if (axes.rounding !== null) {
    parts.push(axes.rounding === 0 ? 'unrounded' : 'rounded');
  }
  return parts.join(', ');
}

export function areChartPairMates(a: IpaSymbol, b: IpaSymbol): boolean {
  if (a.symbol === b.symbol) return true;
  return CHART_VOWEL_PAIRS.some(([unrounded, rounded]) => {
    return (
      (a.symbol === unrounded && b.symbol === rounded) ||
      (a.symbol === rounded && b.symbol === unrounded)
    );
  });
}
