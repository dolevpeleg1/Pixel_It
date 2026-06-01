import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../types';
import { pickFromCamera, pickFromLibrary } from '../utils/pickPhoto';
import { verifyOpenCVLoaded } from '../utils/verifyOpenCV';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opencvStatus, setOpencvStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!__DEV__) {
      return;
    }

    let isMounted = true;

    void verifyOpenCVLoaded().then((result) => {
      if (!isMounted) {
        return;
      }

      if (result.ok) {
        setOpencvStatus('OpenCV ready');
        console.log('[Pixel It] OpenCV module loaded successfully.');
      } else {
        setOpencvStatus('OpenCV unavailable (dev client required)');
        console.warn('[Pixel It] OpenCV check failed:', result.message);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePick(source: 'camera' | 'library') {
    setErrorMessage(null);
    setLoading(true);

    try {
      const result =
        source === 'camera' ? await pickFromCamera() : await pickFromLibrary();

      if (result.ok) {
        navigation.navigate('Adjust', {
          photoUri: result.uri,
          imageWidth: result.width,
          imageHeight: result.height,
        });
        return;
      }

      if (result.reason === 'prepare_failed') {
        setErrorMessage('Could not prepare that photo. Try another image.');
        return;
      }

      if (result.reason === 'permission_denied') {
        setErrorMessage(
          source === 'camera'
            ? 'Camera access is required to take a photo. Enable it in Settings.'
            : 'Photo library access is required to choose a photo. Enable it in Settings.',
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pixel It</Text>
      <Text style={styles.subtitle}>
        Turn a photo of any screen into a clean, flat screenshot.
      </Text>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => handlePick('camera')}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Take Photo</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.buttonSecondary, loading && styles.buttonDisabled]}
        onPress={() => handlePick('library')}
        disabled={loading}
      >
        <Text style={styles.buttonSecondaryText}>Choose from Library</Text>
      </Pressable>

      {opencvStatus ? <Text style={styles.devStatus}>{opencvStatus}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    lineHeight: 22,
  },
  error: {
    fontSize: 14,
    color: '#b00020',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
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
  devStatus: {
    marginTop: 24,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});
