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

## Download script

From the project root, download every clip referenced in `src/data/symbols.json`:

```bash
npm run download-audio
```

Options:

| Flag | Description |
|------|-------------|
| `--force` | Re-download even if the file already exists |
| `--dry-run` | Print URLs without downloading |
| `--speaker JE` | Limit to one or more speakers (`JE`, `JH`, `PL`, `JW`) |

Examples:

```bash
npm run download-audio -- --speaker JE
npm run download-audio -- --force --speaker PL,JW
npm run download-audio -- --dry-run
```

Files are written to `public/audio/{speakerId}/{fileKey}.mp3` from:

`https://www.internationalphoneticassociation.org/IPAcharts/common_files/sounds/{JE|JH|PL|JW}/{fileKey}.mp3`

**Licensing:** Audio is copyrighted by the respective phoneticians. Use only for permitted non-commercial educational purposes and include attribution when publishing. See the [official acknowledgments](https://www.internationalphoneticassociation.org/IPAcharts/common_files/IPA_charts_about.html).

## Other ways to obtain files

1. Record your own pedagogical examples.
2. Use files from a licensed source you already have rights to.

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
