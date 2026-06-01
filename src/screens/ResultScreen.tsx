import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppButton from '../components/AppButton';
import type { RootStackParamList } from '../types';
import { colors, radii, spacing, typography } from '../theme';
import { saveToPhotos, shareImage } from '../utils/exportImage';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ navigation, route }: Props) {
  const { originalUri, processedUri } = route.params;
  const [showOriginal, setShowOriginal] = useState(false);
  const [busyAction, setBusyAction] = useState<'save' | 'share' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const displayUri = showOriginal ? originalUri : processedUri;
  const busy = busyAction !== null;

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
        setStatusMessage(
          'Photo library access is required to save. Enable it in Settings.',
        );
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
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.toggleRow}>
          <Pressable
            style={[
              styles.toggleButton,
              !showOriginal && styles.toggleButtonActive,
            ]}
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
            style={[
              styles.toggleButton,
              showOriginal && styles.toggleButtonActive,
            ]}
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

        <Image
          source={{ uri: displayUri }}
          style={styles.image}
          resizeMode="contain"
        />

        {statusMessage ? (
          <Text style={styles.status}>{statusMessage}</Text>
        ) : null}

        <View style={styles.actions}>
          <AppButton
            label="Share"
            variant="secondary"
            onPress={() => void handleShare()}
            loading={busyAction === 'share'}
            disabled={busy}
            style={styles.actionButton}
          />
          <AppButton
            label="Save to Photos"
            onPress={() => void handleSave()}
            loading={busyAction === 'save'}
            disabled={busy}
            style={styles.actionButton}
          />
        </View>

        <AppButton
          label="Scan Another"
          variant="outline"
          onPress={() => navigation.popToTop()}
          disabled={busy}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.sm,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderNeon,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  toggleTextActive: {
    color: colors.primary,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.imageBackdrop,
    borderRadius: radii.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  status: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
