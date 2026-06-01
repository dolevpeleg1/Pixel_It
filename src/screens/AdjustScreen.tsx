import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CornerOverlay from '../components/CornerOverlay';
import type { CornerSet, RootStackParamList } from '../types';
import { defaultCorners } from '../utils/defaultCorners';
import { processImage } from '../utils/processImage';

type Props = NativeStackScreenProps<RootStackParamList, 'Adjust'>;

export default function AdjustScreen({ navigation, route }: Props) {
  const { photoUri } = route.params;
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [corners, setCorners] = useState<CornerSet | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processError, setProcessError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    setImageSize(null);
    setCorners(null);

    Image.getSize(
      photoUri,
      (width, height) => {
        setImageSize({ width, height });
        setCorners(defaultCorners(width, height));
      },
      () => {
        setLoadError('Could not load image dimensions.');
      },
    );
  }, [photoUri]);

  function handleReset() {
    if (!imageSize) {
      return;
    }
    setCorners(defaultCorners(imageSize.width, imageSize.height));
  }

  async function handleProcess() {
    if (!corners) {
      return;
    }

    setProcessError(null);
    setProcessing(true);
    try {
      const processedUri = await processImage(photoUri, corners);
      navigation.navigate('Result', {
        originalUri: photoUri,
        processedUri,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not process this image.';
      setProcessError(message);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageArea}>
        {loadError ? (
          <Text style={styles.error}>{loadError}</Text>
        ) : imageSize && corners ? (
          <CornerOverlay
            photoUri={photoUri}
            imageWidth={imageSize.width}
            imageHeight={imageSize.height}
            corners={corners}
            onCornersChange={setCorners}
          />
        ) : (
          <ActivityIndicator size="large" color="#111" />
        )}
      </View>

      <Text style={styles.hint}>Drag the corners to match the screen edges.</Text>

      {processError ? <Text style={styles.error}>{processError}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.buttonSecondary, processing && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={processing || !corners}
        >
          <Text style={styles.buttonSecondaryText}>Reset Corners</Text>
        </Pressable>

        <Pressable
          style={[styles.button, processing && styles.buttonDisabled]}
          onPress={handleProcess}
          disabled={processing || !corners}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Process</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  imageArea: {
    flex: 1,
    marginBottom: 12,
  },
  error: {
    fontSize: 14,
    color: '#b00020',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});
