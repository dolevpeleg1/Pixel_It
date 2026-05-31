import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

export type ExportResult =
  | { ok: true }
  | { ok: false; reason: 'permission_denied' }
  | { ok: false; reason: 'sharing_unavailable' }
  | { ok: false; reason: 'error'; message: string };

export async function saveToPhotos(uri: string): Promise<ExportResult> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  try {
    await MediaLibrary.saveToLibraryAsync(uri);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not save to Photos.';
    return { ok: false, reason: 'error', message };
  }
}

export async function shareImage(uri: string): Promise<ExportResult> {
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { ok: false, reason: 'sharing_unavailable' };
  }

  try {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share screenshot',
    });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not share image.';
    return { ok: false, reason: 'error', message };
  }
}
