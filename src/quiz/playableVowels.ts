import { meta, symbolsBySection } from '../data';
import type { IpaSymbol } from '../types';
import { audioExists, audioUrl } from '../utils/audio';

export interface PlayableClip {
  speakerId: string;
  fileKey: string;
  url: string;
}

export interface PlayableVowel {
  symbol: IpaSymbol;
  clips: PlayableClip[];
}

export async function loadPlayableVowels(): Promise<PlayableVowel[]> {
  const vowels = symbolsBySection('vowels');
  const playable: PlayableVowel[] = [];

  for (const sym of vowels) {
    const clips: PlayableClip[] = [];

    for (const author of meta.authors) {
      const speakerAudio = sym.audio.find((a) => a.speakerId === author.id);
      const clip = speakerAudio?.clips[0];
      if (!clip) continue;

      const url = audioUrl(author.id, clip.fileKey);
      if (await audioExists(url)) {
        clips.push({ speakerId: author.id, fileKey: clip.fileKey, url });
      }
    }

    if (clips.length > 0) {
      playable.push({ symbol: sym, clips });
    }
  }

  return playable.sort((a, b) => a.symbol.row - b.symbol.row || a.symbol.col - b.symbol.col);
}
