export type SectionId =
  | 'pulmonic'
  | 'non-pulmonic'
  | 'other'
  | 'diacritics'
  | 'vowels'
  | 'suprasegmentals'
  | 'tones';

export interface AudioClip {
  exampleIndex: number;
  fileKey: string;
}

export interface SpeakerAudio {
  speakerId: string;
  clips: AudioClip[];
}

export interface SymbolExample {
  index: number;
  text: string;
}

export interface IpaSymbol {
  id: number;
  symbol: string;
  description: string;
  descriptionShort: string | null;
  ipaName: string;
  ipaNumber: string;
  unicodeName: string;
  unicodeRange: string;
  unicodeHex: string;
  tipa: string;
  afii: string;
  section: SectionId;
  tableType: number;
  symbolType: number;
  col: number;
  row: number;
  examples: SymbolExample[];
  audio: SpeakerAudio[];
}

export interface Section {
  id: SectionId;
  name: string;
  cols: number;
  rows: number;
  comment: string | null;
}

export interface Author {
  id: string;
  name: string;
}

export interface ChartMeta {
  places: string[];
  manners: string[];
  airstreams: string[];
  frontness: string[];
  heights: string[];
  toneTypes: string[];
  authors: Author[];
  impossible: { col: number; row: number }[];
}
