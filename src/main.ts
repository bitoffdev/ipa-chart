import './styles/base.css';
import './styles/charts.css';
import './styles/modal.css';

import { sections } from './data';
import { escapeHtml } from './utils/html';
import { renderSectionContent } from './render/gridChart';
import { renderPulmonicChart } from './render/pulmonicChart';
import { renderVowelChart } from './render/vowelChart';
import { initModal, openSymbolModal } from './ui/modal';

function pageUrl(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}${path}`.replace(/\/{2,}/g, '/');
}

function renderSection(section: (typeof sections)[0]): string {
  let content = '';
  if (section.id === 'pulmonic') {
    content = renderPulmonicChart();
  } else if (section.id === 'vowels') {
    content = renderVowelChart();
  } else {
    content = renderSectionContent(section.id);
  }

  const comment =
    section.comment && section.comment !== ''
      ? `<p class="section-comment">${escapeHtml(section.comment)}</p>`
      : '';

  return `
    <section class="chart-section" id="section-${section.id}">
      <details open>
        <summary><h2>${section.name}</h2></summary>
        <div class="section-body">
          ${content}
          ${comment}
        </div>
      </details>
    </section>
  `;
}

function buildApp(): void {
  const app = document.getElementById('app');
  if (!app) return;

  const navLinks =
    sections
      .map((s) => `<a href="#section-${s.id}">${s.name.replace(' (PULMONIC)', '').replace(' (NON-PULMONIC)', '')}</a>`)
      .join('') + `<a href="${pageUrl('quiz.html')}">Vowel Quiz</a>`;

  app.innerHTML = `
    <header class="site-header">
      <h1>Interactive IPA Chart</h1>
      <p class="site-subtitle">Mobile-friendly chart based on the IPA 2018 revision. Tap any symbol for details and pronunciation.</p>
      <nav class="section-nav" aria-label="Chart sections">${navLinks}</nav>
    </header>
    <main class="chart-sections">
      ${sections.map(renderSection).join('')}
    </main>
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
    <div id="modal-overlay" class="modal-overlay" aria-hidden="true"></div>
  `;
}

function bindSymbolClicks(): void {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.sym-btn');
    if (!btn?.dataset.symbolId) return;
    const id = Number(btn.dataset.symbolId);
    void openSymbolModal(id);
  });
}

buildApp();
initModal();
bindSymbolClicks();
