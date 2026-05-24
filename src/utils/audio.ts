export function audioUrl(speakerId: string, fileKey: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base}audio/${speakerId}/${fileKey}.mp3`;
}

export async function audioExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}
