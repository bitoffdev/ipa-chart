# Audio bundle instructions

The app expects MP3 files in four speaker folders matching the official IPA chart:

```
public/audio/
  JE/   J. Esling
  JH/   J. House
  PL/   P. Ladefoged
  JW/   J. Wells
```

## Filename convention

- Primary clip: `{unicodeHex}.mp3` (e.g. `0070.mp3` for /p/)
- Extra examples: `{unicodeHex}_1.mp3`, `{unicodeHex}_2.mp3`, …
- Compound Unicode values use `_` instead of ` + ` (e.g. `0070_02BC.mp3` for `pʼ`)

The `unicodeHex` field on each symbol in `src/data/symbols.json` defines the expected keys.

## Obtaining files

You are responsible for legally obtaining and bundling audio. Options:

1. Record your own pedagogical examples.
2. Use files from a licensed source you already have rights to.
3. For personal study, you may copy files from the official chart in a browser (network tab) while respecting the IPA site terms and speaker copyrights.

Official paths follow:

`https://www.internationalphoneticassociation.org/IPAcharts/common_files/sounds/{JE|JH|PL|JW}/{fileKey}.mp3`

## Verify locally

After adding files:

```bash
npm run dev
```

Open a symbol that should have audio (e.g. **p**) and press Play for each speaker. Missing files show a disabled **—** button.

## Repository size

The full set is large (four speakers × many clips). If the repo exceeds GitHub’s recommended size:

```bash
git lfs install
git lfs track "public/audio/**/*.mp3"
```

Or ship a **partial demo** (common consonants/vowels only) and document the rest here.

## Speaker attribution

When publishing, credit the phoneticians named in the app modal and link to the [official acknowledgments page](https://www.internationalphoneticassociation.org/IPAcharts/common_files/IPA_charts_about.html).
