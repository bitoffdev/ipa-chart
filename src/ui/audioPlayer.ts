let currentAudio: HTMLAudioElement | null = null;

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export async function playAudio(url: string, button: HTMLButtonElement): Promise<void> {
  stopAudio();
  const audio = new Audio(url);
  currentAudio = audio;
  button.classList.add('is-playing');
  button.setAttribute('aria-pressed', 'true');

  const cleanup = () => {
    button.classList.remove('is-playing');
    button.removeAttribute('aria-pressed');
    if (currentAudio === audio) currentAudio = null;
  };

  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });

  try {
    await audio.play();
  } catch {
    cleanup();
  }
}
