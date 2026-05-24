# Interactive IPA Chart (Mobile-Friendly)

A responsive clone of the [IPA Association Interactive IPA Chart (2018)](https://www.internationalphoneticassociation.org/IPAcharts/IPA_charts_EI/IPA_charts_EI.html), optimized for phones and tablets.

## Features

- All seven chart sections (pulmonic/non-pulmonic consonants, other symbols, diacritics, vowels, suprasegmentals, tones)
- Tap any symbol for a detail sheet with IPA/Unicode/TIPA/AFII metadata
- Pronunciation playback from four named speakers (when audio is bundled)
- Horizontal scroll with sticky labels on the pulmonic consonant table
- Vowel chart axis labels (tongue front–back, mouth close–open)

## Development

```bash
cd ipa-chart
npm install
npm run dev
```

Open http://localhost:5173

### Regenerate symbol data

If you update cached official array files under `scripts/cache/`:

```bash
npm run extract-data
```

This writes `src/data/symbols.json`, `sections.json`, and `meta.json`.

## Build

```bash
npm run build
npm run preview
```

### Test GitHub Pages base path locally

For a project site at `https://<user>.github.io/<repo>/`:

```bash
GITHUB_PAGES_BASE=/ipa-chart/ npm run build
npx vite preview
```

Use the URL shown by the preview server (assets load under `/ipa-chart/`).

## Audio

Download pronunciation clips from the official chart (see licensing notes in [AUDIO.md](AUDIO.md)):

```bash
npm run download-audio
```

Or add MP3 files manually under `public/audio/` as described in [AUDIO.md](AUDIO.md).

## Deploy to GitHub Pages

1. Push this repo to GitHub (e.g. repo name `ipa-chart`).
2. **Settings → Pages → Build and deployment → Source:** GitHub Actions.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys `dist/`.
4. Visit `https://<username>.github.io/<repo>/`.

The workflow sets `GITHUB_PAGES_BASE=/<repo>/` automatically. If you rename the repo, the next deploy picks up the new path.

For a user/org site (`username.github.io` repo), change `vite.config.ts` / workflow env to use `GITHUB_PAGES_BASE=/`.

## License and attribution

- Chart metadata is derived from the official IPA interactive chart for educational use.
- This project is **not affiliated** with the International Phonetic Association.
- Official chart materials are subject to [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/) where applicable.
- Audio recordings remain the property of their respective contributors; see the [official acknowledgments](https://www.internationalphoneticassociation.org/IPAcharts/common_files/IPA_charts_about.html).
