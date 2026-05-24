import { meta, getSymbol } from '../data';
import type { IpaSymbol } from '../types';
import { audioExists, audioUrl } from '../utils/audio';
import { decodeTipa, escapeHtml } from '../utils/html';
import { playAudio, stopAudio } from './audioPlayer';

let overlay: HTMLElement | null = null;

function formatDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderSpeakerRows(sym: IpaSymbol): string {
  let rows = '';
  for (const author of meta.authors) {
    const speakerAudio = sym.audio.find((a) => a.speakerId === author.id);
    const clips = speakerAudio?.clips ?? [];
    if (clips.length === 0) continue;

    rows += `<tr class="speaker-row"><th scope="row">${escapeHtml(author.name)}</th><td>`;
    for (const clip of clips) {
      const example = sym.examples.find((e) => e.index === clip.exampleIndex);
      const exampleText = example?.text ?? (clip.exampleIndex === 0 ? sym.symbol : '');
      rows += `
        <div class="speaker-clip">
          <button type="button" class="play-btn" data-speaker="${author.id}" data-file="${escapeHtml(clip.fileKey)}" aria-label="Play ${escapeHtml(author.name)} recording">▶</button>
          ${exampleText ? `<span class="speaker-example ipa-text">${escapeHtml(exampleText)}</span>` : ''}
        </div>`;
    }
    rows += '</td></tr>';
  }
  return rows;
}

function buildModalHtml(sym: IpaSymbol): string {
  const glyph = sym.symbol;
  return `
    <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" class="modal-close" aria-label="Close">×</button>
      <div class="modal-header">
        <div class="modal-glyph ipa-text" aria-hidden="true">${escapeHtml(glyph)}</div>
        <h2 id="modal-title" class="modal-title ipa-text">${escapeHtml(glyph)}</h2>
      </div>
      <div class="modal-body">
        <dl class="meta-list">
          <div><dt>Description</dt><dd>${escapeHtml(formatDescription(sym.description))}</dd></div>
          <div><dt>IPA name</dt><dd>${escapeHtml(sym.ipaName)}</dd></div>
          <div><dt>IPA number</dt><dd>${escapeHtml(sym.ipaNumber)}</dd></div>
          <div><dt>Unicode name</dt><dd>${escapeHtml(sym.unicodeName)}</dd></div>
          <div><dt>Unicode range</dt><dd>${escapeHtml(sym.unicodeRange)}</dd></div>
          <div><dt>Hex value</dt><dd>${escapeHtml(sym.unicodeHex)}</dd></div>
          <div><dt>TIPA code</dt><dd><code>${escapeHtml(decodeTipa(sym.tipa))}</code></dd></div>
          <div><dt>AFII code</dt><dd><code>${escapeHtml(sym.afii)}</code></dd></div>
        </dl>
        <h3 class="pronunciation-heading">Pronunciation</h3>
        <table class="speaker-table">
          <tbody>
            ${renderSpeakerRows(sym)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function wirePlayButtons(container: HTMLElement): Promise<void> {
  const buttons = container.querySelectorAll<HTMLButtonElement>('.play-btn');
  for (const btn of buttons) {
    const speaker = btn.dataset.speaker!;
    const file = btn.dataset.file!;
    const url = audioUrl(speaker, file);
    const exists = await audioExists(url);
    if (!exists) {
      btn.disabled = true;
      btn.title = 'Audio file not bundled';
      btn.textContent = '—';
      continue;
    }
    btn.addEventListener('click', () => playAudio(url, btn));
  }
}

function closeModal(): void {
  stopAudio();
  overlay?.classList.remove('is-open');
  overlay?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

export function initModal(): void {
  overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  overlay.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === overlay || target.closest('.modal-close')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('is-open')) closeModal();
  });
}

export async function openSymbolModal(id: number): Promise<void> {
  const sym = getSymbol(id);
  if (!sym || !overlay) return;

  overlay.innerHTML = buildModalHtml(sym);
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');

  await wirePlayButtons(overlay);
}
