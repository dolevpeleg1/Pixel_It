import type { ImagePickerAsset } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { normalizePhotoUri, persistPickerUri } from './normalizePhoto';

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 1,
  preferredAssetRepresentationMode:
    ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
};

export type PickPhotoResult =
  | { ok: true; uri: string; width: number; height: number }
  | { ok: false; reason: 'cancelled' }
  | { ok: false; reason: 'permission_denied'; source: 'camera' | 'library' }
  | { ok: false; reason: 'prepare_failed' };

async function preparePickedAsset(asset: ImagePickerAsset): Promise<PickPhotoResult> {
  try {
    const persistedUri = await persistPickerUri(asset.uri, asset.mimeType);
    const normalized = await normalizePhotoUri(persistedUri, {
      width: asset.width,
      height: asset.height,
      mimeType: asset.mimeType,
    });
    return {
      ok: true,
      uri: normalized.uri,
      width: normalized.width,
      height: normalized.height,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[Pixel It] prepare photo failed:', error);
    }
    return { ok: false, reason: 'prepare_failed' };
  }
}

export async function pickFromCamera(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'camera' };
  }

  const result = await ImagePicker.launchCameraAsync(pickerOptions);
  if (result.canceled || !result.assets[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  return preparePickedAsset(result.assets[0]);
}

export async function pickFromLibrary(): Promise<PickPhotoResult> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return { ok: false, reason: 'permission_denied', source: 'library' };
  }

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled || !result.assets[0]) {
    return { ok: false, reason: 'cancelled' };
  }

  return preparePickedAsset(result.assets[0]);
}
