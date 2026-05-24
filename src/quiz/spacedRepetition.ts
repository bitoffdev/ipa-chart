import type { PlayableVowel } from './playableVowels';

const STORAGE_KEY = 'ipa-chart-vowel-quiz-srs';

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const FIRST_INTERVAL_MS = 10 * 60 * 1000;
const EASE_BONUS = 0.05;

export interface SrsCardState {
  dueAt: number;
  intervalMs: number;
  ease: number;
}

interface SrsStore {
  cards: Record<string, SrsCardState>;
}

function defaultCard(now: number): SrsCardState {
  return { dueAt: now, intervalMs: 0, ease: DEFAULT_EASE };
}

function emptyStore(): SrsStore {
  return { cards: {} };
}

export function loadSrsStore(): SrsStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<SrsStore>;
    if (parsed.cards && typeof parsed.cards === 'object') return { cards: parsed.cards };
  } catch {
    // ignore corrupt storage
  }
  return emptyStore();
}

export function saveSrsStore(store: SrsStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function resetSrsStore(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function getCard(store: SrsStore, symbolId: number, now: number): SrsCardState {
  return store.cards[String(symbolId)] ?? defaultCard(now);
}

export function recordSrsReview(symbolId: number, correct: boolean, now = Date.now()): void {
  const store = loadSrsStore();
  const card = getCard(store, symbolId, now);

  if (correct) {
    if (card.intervalMs === 0) {
      card.intervalMs = FIRST_INTERVAL_MS;
    } else {
      card.intervalMs = Math.round(card.intervalMs * card.ease);
    }
    card.ease = Math.min(DEFAULT_EASE, card.ease + EASE_BONUS);
    card.dueAt = now + card.intervalMs;
  } else {
    card.intervalMs = 0;
    card.ease = Math.max(MIN_EASE, card.ease - 0.15);
    card.dueAt = now;
  }

  store.cards[String(symbolId)] = card;
  saveSrsStore(store);
}

function weightedPick(items: PlayableVowel[], weights: number[]): PlayableVowel {
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

export function pickSpacedVowel(
  playable: PlayableVowel[],
  lastVowelId: number | null,
  now = Date.now(),
): PlayableVowel {
  let pool = playable;
  if (playable.length > 1 && lastVowelId !== null) {
    pool = playable.filter((v) => v.symbol.id !== lastVowelId);
  }
  if (pool.length === 1) return pool[0];

  const store = loadSrsStore();
  const due = pool.filter((v) => getCard(store, v.symbol.id, now).dueAt <= now);

  if (due.length > 0) {
    const weights = due.map((v) => Math.max(1, now - getCard(store, v.symbol.id, now).dueAt + 1000));
    return weightedPick(due, weights);
  }

  const sorted = [...pool].sort(
    (a, b) => getCard(store, a.symbol.id, now).dueAt - getCard(store, b.symbol.id, now).dueAt,
  );
  const soonest = sorted.slice(0, Math.min(3, sorted.length));
  return soonest[Math.floor(Math.random() * soonest.length)];
}
