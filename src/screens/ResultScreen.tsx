import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { RootStackParamList } from '../types';
import { saveToPhotos, shareImage } from '../utils/exportImage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { originalUri, processedUri } = route.params;
  const [showOriginal, setShowOriginal] = useState(false);
  const [busyAction, setBusyAction] = useState<'save' | 'share' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const displayUri = showOriginal ? originalUri : processedUri;

  async function handleSave() {
    setStatusMessage(null);
    setBusyAction('save');

    try {
      const result = await saveToPhotos(processedUri);
      if (result.ok) {
        setStatusMessage('Saved to Photos.');
        return;
      }

      if (result.reason === 'permission_denied') {
        setStatusMessage('Photo library access is required to save. Enable it in Settings.');
        return;
      }

      if (result.reason === 'error') {
        setStatusMessage(result.message);
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function handleShare() {
    setStatusMessage(null);
    setBusyAction('share');

    try {
      const result = await shareImage(processedUri);
      if (result.ok) {
        return;
      }

      if (result.reason === 'sharing_unavailable') {
        setStatusMessage('Sharing is not available on this device.');
        return;
      }

      if (result.reason === 'error') {
        setStatusMessage(result.message);
      }
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleButton, !showOriginal && styles.toggleButtonActive]}
          onPress={() => setShowOriginal(false)}
        >
          <Text
            style={[
              styles.toggleText,
              !showOriginal && styles.toggleTextActive,
            ]}
          >
            After
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, showOriginal && styles.toggleButtonActive]}
          onPress={() => setShowOriginal(true)}
        >
          <Text
            style={[
              styles.toggleText,
              showOriginal && styles.toggleTextActive,
            ]}
          >
            Before
          </Text>
        </Pressable>
      </View>

      <Image source={{ uri: displayUri }} style={styles.image} resizeMode="contain" />

      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          style={[styles.buttonSecondary, busyAction !== null && styles.buttonDisabled]}
          onPress={handleShare}
          disabled={busyAction !== null}
        >
          {busyAction === 'share' ? (
            <ActivityIndicator color="#111" />
          ) : (
            <Text style={styles.buttonSecondaryText}>Share</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.button, busyAction !== null && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={busyAction !== null}
        >
          {busyAction === 'save' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save to Photos</Text>
          )}
        </Pressable>
      </View>

      <Pressable
        style={[styles.buttonOutline, busyAction !== null && styles.buttonDisabled]}
        onPress={() => navigation.popToTop()}
        disabled={busyAction !== null}
      >
        <Text style={styles.buttonOutlineText}>Scan Another</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#111',
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
  buttonOutline: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 14,
    paddingHorizontal: 16,
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
  buttonOutlineText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});
