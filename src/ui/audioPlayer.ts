let currentAudio: HTMLAudioElement | null = null;
let currentButton: HTMLButtonElement | null = null;

function clearButtonState(): void {
  if (currentButton) {
    currentButton.classList.remove('is-playing');
    currentButton.removeAttribute('aria-pressed');
    currentButton = null;
  }
}

export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  clearButtonState();
}

export async function playAudioUrl(url: string, button?: HTMLButtonElement | null): Promise<void> {
  stopAudio();
  const audio = new Audio(url);
  currentAudio = audio;

  if (button) {
    currentButton = button;
    button.classList.add('is-playing');
    button.setAttribute('aria-pressed', 'true');
  }

  const cleanup = () => {
    if (currentAudio === audio) currentAudio = null;
    if (currentButton === button) clearButtonState();
  };

  audio.addEventListener('ended', cleanup, { once: true });
  audio.addEventListener('error', cleanup, { once: true });

  try {
    await audio.play();
  } catch {
    cleanup();
  }
}

export async function playAudio(url: string, button: HTMLButtonElement): Promise<void> {
  await playAudioUrl(url, button);
}
