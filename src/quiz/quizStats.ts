import type { IpaSymbol } from '../types';
import { escapeHtml } from '../utils/html';
import {
  FRONTNESS_LABELS,
  OPENNESS_LABELS,
  ROUNDING_BUCKETS,
  vowelAxisBuckets,
} from './vowelAxes';
import { resetSrsStore, recordSrsReview } from './spacedRepetition';

const STORAGE_KEY = 'ipa-chart-vowel-quiz-stats';

export interface BucketStats {
  correct: number;
  answered: number;
}

export interface QuizStats {
  correct: number;
  answered: number;
  byOpenness: Record<string, BucketStats>;
  byFrontness: Record<string, BucketStats>;
  byRounding: Record<string, BucketStats>;
}

function emptyStats(): QuizStats {
  return { correct: 0, answered: 0, byOpenness: {}, byFrontness: {}, byRounding: {} };
}

function emptyBucket(): BucketStats {
  return { correct: 0, answered: 0 };
}

function incrementBucket(map: Record<string, BucketStats>, key: string, correct: boolean): void {
  const bucket = map[key] ?? emptyBucket();
  bucket.answered += 1;
  if (correct) bucket.correct += 1;
  map[key] = bucket;
}

export function loadQuizStats(): QuizStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const parsed = JSON.parse(raw) as Partial<QuizStats>;
    if (
      typeof parsed.correct === 'number' &&
      typeof parsed.answered === 'number' &&
      parsed.correct >= 0 &&
      parsed.answered >= 0 &&
      parsed.correct <= parsed.answered
    ) {
      return {
        correct: parsed.correct,
        answered: parsed.answered,
        byOpenness: parsed.byOpenness ?? {},
        byFrontness: parsed.byFrontness ?? {},
        byRounding: parsed.byRounding ?? {},
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return emptyStats();
}

export function saveQuizStats(stats: QuizStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function accuracyPercent(stats: Pick<QuizStats, 'correct' | 'answered'>): number | null {
  if (stats.answered === 0) return null;
  return Math.round((stats.correct / stats.answered) * 100);
}

function formatBucket(stats: BucketStats | undefined): string {
  if (!stats || stats.answered === 0) return '—';
  const pct = Math.round((stats.correct / stats.answered) * 100);
  return `${pct}% (${stats.correct}/${stats.answered})`;
}

function renderBreakdownSection(
  title: string,
  labels: readonly string[],
  buckets: Record<string, BucketStats>,
): string {
  const rows = labels
    .map(
      (label) => `
        <tr>
          <th scope="row">${escapeHtml(label)}</th>
          <td>${formatBucket(buckets[label])}</td>
        </tr>`,
    )
    .join('');

  return `
    <section class="stats-breakdown-section">
      <h3 class="stats-breakdown-heading">${escapeHtml(title)}</h3>
      <table class="stats-breakdown-table">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function buildStatsModalHtml(stats: QuizStats): string {
  const overall = accuracyPercent(stats);
  const overallText =
    overall === null ? 'No answers yet' : `${overall}% correct (${stats.correct}/${stats.answered})`;

  return `
    <div class="modal-dialog stats-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="stats-modal-title">
      <button type="button" class="modal-close" aria-label="Close">×</button>
      <div class="modal-header stats-modal-header">
        <h2 id="stats-modal-title" class="modal-title">Accuracy breakdown</h2>
      </div>
      <div class="modal-body">
        <p class="stats-modal-overall">${escapeHtml(overallText)}</p>
        <div class="stats-breakdown">
          ${renderBreakdownSection('Open / Close', OPENNESS_LABELS, stats.byOpenness)}
          ${renderBreakdownSection('Front / Back', FRONTNESS_LABELS, stats.byFrontness)}
          ${renderBreakdownSection('Roundness', ROUNDING_BUCKETS, stats.byRounding)}
        </div>
      </div>
    </div>
  `;
}

function renderStatsPanel(container: HTMLElement, stats: QuizStats): void {
  const percent = accuracyPercent(stats);
  const summary = container.querySelector<HTMLElement>('.quiz-stats-summary');
  if (!summary) return;

  summary.textContent =
    percent === null
      ? `—% · ${stats.answered} answered`
      : `${percent}% · ${stats.answered} answered`;
}

let statsContainer: HTMLElement | null = null;
let statsModalOverlay: HTMLElement | null = null;

function openStatsModal(): void {
  if (!statsModalOverlay) return;
  statsModalOverlay.innerHTML = buildStatsModalHtml(loadQuizStats());
  statsModalOverlay.classList.add('is-open');
  statsModalOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeStatsModal(): void {
  if (!statsModalOverlay) return;
  statsModalOverlay.classList.remove('is-open');
  statsModalOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

export function initStatsModal(): void {
  statsModalOverlay = document.getElementById('stats-modal-overlay');
  if (!statsModalOverlay) return;

  statsModalOverlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === statsModalOverlay || target.closest('.modal-close')) closeStatsModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && statsModalOverlay?.classList.contains('is-open')) closeStatsModal();
  });
}

export function mountQuizStats(container: HTMLElement): void {
  statsContainer = container;
  renderStatsPanel(container, loadQuizStats());

  container.querySelector<HTMLButtonElement>('.quiz-stats-summary')?.addEventListener('click', () => {
    openStatsModal();
  });

  container.querySelector<HTMLButtonElement>('.quiz-stats-reset')?.addEventListener('click', (e) => {
    e.stopPropagation();
    saveQuizStats(emptyStats());
    resetSrsStore();
    renderStatsPanel(container, loadQuizStats());
  });
}

export function recordQuizAnswer(correct: boolean, correctSym: IpaSymbol): void {
  const stats = loadQuizStats();
  const buckets = vowelAxisBuckets(correctSym);

  stats.answered += 1;
  if (correct) stats.correct += 1;

  incrementBucket(stats.byOpenness, buckets.openness, correct);
  incrementBucket(stats.byFrontness, buckets.frontness, correct);
  incrementBucket(stats.byRounding, buckets.rounding, correct);

  saveQuizStats(stats);
  recordSrsReview(correctSym.id, correct);
  if (statsContainer) renderStatsPanel(statsContainer, stats);
}
