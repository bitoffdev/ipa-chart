/**
 * One-time extractor: reads cached official arrays.js into JSON.
 * Run: node scripts/extract-ipa-data.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cacheDir = join(__dirname, 'cache');
const outDir = join(__dirname, '..', 'src', 'data');

const arraysJs = readFileSync(join(cacheDir, 'arrays.js'), 'utf8');
const arraysElseJs = readFileSync(join(cacheDir, 'arrays_else.js'), 'utf8');

const sandbox = {};
vm.runInNewContext(arraysJs + '\n' + arraysElseJs, sandbox);

const {
  arrTables,
  arrPlaces,
  arrManners,
  arrAirstreams,
  arrFBness,
  arrHeight,
  arrTones,
  arrImp,
  arrSymbols,
  arrAuthors,
} = sandbox;

const SECTION_IDS = [
  'pulmonic',
  'non-pulmonic',
  'other',
  'diacritics',
  'vowels',
  'suprasegmentals',
  'tones',
];

function audioFileKey(unicodeHex, exampleIndex = 0) {
  let key = unicodeHex.replace(/\s*\+\s*/g, '_');
  if (exampleIndex > 0) key += `_${exampleIndex}`;
  return key;
}

function buildExamples(sym) {
  const examples = [];
  if (sym.Ex) examples.push({ index: 0, text: sym.Ex });
  if (sym.Ex_1) examples.push({ index: 1, text: sym.Ex_1 });
  if (sym.Ex_2) examples.push({ index: 2, text: sym.Ex_2 });
  if (sym.Ex_3) examples.push({ index: 3, text: sym.Ex_3 });
  return examples;
}

const symbols = arrSymbols.map((sym) => {
  const sectionIndex = sym.T_Type;
  const audio = (sym.Audio || []).map((row, speakerIndex) => ({
    speakerId: arrAuthors[speakerIndex].AI,
    clips: row
      .map((hasClip, exampleIndex) => (hasClip ? { exampleIndex, fileKey: audioFileKey(sym.U_No, exampleIndex) } : null))
      .filter(Boolean),
  }));

  return {
    id: sym.SID,
    symbol: sym.Symbol,
    description: sym.Descr,
    descriptionShort: sym.Descr_Short || null,
    ipaName: sym.IPA_Name,
    ipaNumber: sym.IPA_No,
    unicodeName: sym.U_Name,
    unicodeRange: sym.U_Range,
    unicodeHex: sym.U_No,
    tipa: sym.TIPA,
    afii: sym.AFII,
    section: SECTION_IDS[sectionIndex] ?? `unknown-${sectionIndex}`,
    tableType: sym.T_Type,
    symbolType: sym.S_Type,
    col: sym.Col_No,
    row: sym.Row_No,
    examples: buildExamples(sym),
    audio,
  };
});

const impossible = arrImp.map((c) => ({ col: c.Col_No, row: c.Row_No }));

const sections = arrTables.map((t, i) => ({
  id: SECTION_IDS[i],
  name: t.T_Name,
  cols: t.T_Cols,
  rows: t.T_Rows,
  comment: t.T_Comm.replace(/&nbsp;/g, '').trim() || null,
}));

const meta = {
  places: arrPlaces,
  manners: arrManners,
  airstreams: arrAirstreams,
  frontness: arrFBness,
  heights: arrHeight,
  toneTypes: arrTones,
  authors: arrAuthors.map((a) => ({ id: a.AI, name: a.AName })),
  impossible,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'symbols.json'), JSON.stringify(symbols, null, 2));
writeFileSync(join(outDir, 'sections.json'), JSON.stringify(sections, null, 2));
writeFileSync(join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));

console.log(`Wrote ${symbols.length} symbols, ${sections.length} sections`);
