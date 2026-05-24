import { symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';
import { renderQuizVowelChart } from '../render/quizVowelChart';
import { playAudioUrl } from '../ui/audioPlayer';
import { formatWrongGuessFeedback } from './vowelAxes';
import type { PlayableClip, PlayableVowel } from './playableVowels';

interface Round {
  vowel: PlayableVowel;
  clip: PlayableClip;
}

const SPEAKER_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
`;

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickRound(playable: PlayableVowel[], lastVowelId: number | null): Round {
  let pool = playable;
  if (playable.length > 1 && lastVowelId !== null) {
    pool = playable.filter((v) => v.symbol.id !== lastVowelId);
  }
  const vowel = pickRandom(pool);
  const clip = pickRandom(vowel.clips);
  return { vowel, clip };
}

export function createVowelQuiz(root: HTMLElement, playable: PlayableVowel[]): void {
  const allVowels = symbolsBySection('vowels');
  const playableIds = new Set(playable.map((v) => v.symbol.id));
  const symbolById = new Map(allVowels.map((s) => [s.id, s]));

  let currentRound: Round | null = null;
  let lastVowelId: number | null = null;
  let answered = false;

  root.innerHTML = `
    <div class="quiz-controls">
      <button type="button" class="quiz-play-btn" aria-label="Play sound">${SPEAKER_ICON}</button>
      <div class="quiz-feedback" aria-live="polite">
        <p class="quiz-feedback-main"></p>
        <p class="quiz-feedback-detail"></p>
      </div>
      <button type="button" class="quiz-next-btn" hidden>Next</button>
    </div>
    ${renderQuizVowelChart(allVowels, playableIds)}
  `;

  const playBtn = root.querySelector<HTMLButtonElement>('.quiz-play-btn')!;
  const feedbackEl = root.querySelector<HTMLDivElement>('.quiz-feedback')!;
  const feedbackMainEl = root.querySelector<HTMLParagraphElement>('.quiz-feedback-main')!;
  const feedbackDetailEl = root.querySelector<HTMLParagraphElement>('.quiz-feedback-detail')!;
  const nextBtn = root.querySelector<HTMLButtonElement>('.quiz-next-btn')!;
  const answerBtns = root.querySelectorAll<HTMLButtonElement>('.quiz-answer-btn[data-symbol-id]');

  function clearAnswerStyles(): void {
    for (const btn of answerBtns) {
      btn.disabled = false;
      btn.classList.remove('is-correct', 'is-wrong', 'is-reveal');
    }
  }

  function startRound(): void {
    answered = false;
    currentRound = pickRound(playable, lastVowelId);
    lastVowelId = currentRound.vowel.symbol.id;

    clearAnswerStyles();
    feedbackMainEl.textContent = '';
    feedbackDetailEl.textContent = '';
    feedbackEl.className = 'quiz-feedback';
    nextBtn.hidden = true;
  }

  function showFeedback(correct: boolean, guessSym: IpaSymbol, correctSym: IpaSymbol): void {
    if (correct) {
      feedbackMainEl.textContent = 'Correct!';
      feedbackDetailEl.textContent = '';
      feedbackEl.className = 'quiz-feedback is-correct';
    } else {
      const { main, detail, answerAxes } = formatWrongGuessFeedback(guessSym, correctSym);
      feedbackMainEl.textContent = main;
      feedbackDetailEl.textContent = detail
        ? `${detail} Answer: ${answerAxes}.`
        : `Answer: ${answerAxes}.`;
      feedbackEl.className = 'quiz-feedback is-wrong';
    }
    nextBtn.hidden = false;
  }

  function playCurrentRound(): void {
    if (!currentRound) return;
    void playAudioUrl(currentRound.clip.url, playBtn);
  }

  playBtn.addEventListener('click', () => {
    playCurrentRound();
  });

  nextBtn.addEventListener('click', () => {
    startRound();
    playCurrentRound();
  });

  for (const btn of answerBtns) {
    btn.addEventListener('click', () => {
      if (answered || !currentRound) return;

      answered = true;
      const selectedId = Number(btn.dataset.symbolId);
      const correctId = currentRound.vowel.symbol.id;
      const correct = selectedId === correctId;

      for (const answerBtn of answerBtns) {
        answerBtn.disabled = true;
        const id = Number(answerBtn.dataset.symbolId);
        if (id === correctId) {
          answerBtn.classList.add('is-correct');
          if (!correct) answerBtn.classList.add('is-reveal');
        } else if (id === selectedId && !correct) {
          answerBtn.classList.add('is-wrong');
        }
      }

      const correctSym = currentRound.vowel.symbol;
      const guessSym = symbolById.get(selectedId);
      if (!guessSym) return;

      showFeedback(correct, guessSym, correctSym);
    });
  }

  startRound();
}
