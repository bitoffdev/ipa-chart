import './styles/base.css';
import './styles/charts.css';
import './styles/modal.css';
import './styles/quiz.css';

import { loadPlayableVowels } from './quiz/playableVowels';
import { initStatsModal, mountQuizStats } from './quiz/quizStats';
import { createVowelQuiz } from './quiz/vowelQuiz';

function pageUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path}`.replace(/\/{2,}/g, '/');
}

const FOOTER_HTML = `
  <footer class="site-footer">
    <p>
      Chart data derived from the
      <a href="https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_EI/IPA_charts_EI.html" rel="noopener noreferrer">International Phonetic Association Interactive IPA Chart (2018)</a>.
      Audio recordings are subject to their respective copyright holders; see <a href="https://www.internationalphoneticassociation.org/IPAcharts/common_files/IPA_charts_about.html" rel="noopener noreferrer">acknowledgments</a>.
    </p>
    <p>
      This project is not affiliated with the International Phonetic Association.
      For non-commercial educational use. Official chart materials are licensed under
      <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" rel="noopener noreferrer">CC BY-NC-ND 4.0</a> where applicable.
    </p>
  </footer>
`;

function buildShell(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <aside id="quiz-stats" class="quiz-stats" aria-label="Quiz accuracy">
      <button type="button" class="quiz-stats-summary" aria-label="View accuracy breakdown">—% · 0 answered</button>
      <button type="button" class="quiz-stats-reset">Reset</button>
    </aside>
    <header class="site-header">
      <h1>Vowel Quiz</h1>
      <p class="site-subtitle">Listen, then tap the vowel you heard.</p>
      <nav class="section-nav" aria-label="Site sections">
        <a href="${pageUrl('index.html')}">IPA Chart</a>
      </nav>
    </header>
    <main class="quiz-main">
      <div id="quiz-root" class="quiz-root">
        <p class="quiz-loading">Loading vowels…</p>
      </div>
    </main>
    ${FOOTER_HTML}
    <div id="stats-modal-overlay" class="modal-overlay" aria-hidden="true"></div>
  `;
}

async function initQuiz(): Promise<void> {
  buildShell();

  const statsEl = document.getElementById('quiz-stats');
  if (statsEl) mountQuizStats(statsEl);
  initStatsModal();

  const root = document.getElementById('quiz-root');
  if (!root) return;

  try {
    const playable = await loadPlayableVowels();
    if (playable.length === 0) {
      root.innerHTML = '<p class="quiz-error">No vowel audio files are available.</p>';
      return;
    }
    createVowelQuiz(root, playable);
  } catch {
    root.innerHTML = '<p class="quiz-error">Could not load vowel audio. Please try again.</p>';
  }
}

void initQuiz();
