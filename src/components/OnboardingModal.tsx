import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, typography } from '../theme';
import AppButton from './AppButton';

type Props = {
  visible: boolean;
  onComplete: () => void;
};

const TIPS = [
  'Photograph a monitor, TV, or phone screen straight-on when you can.',
  'Leave a little margin around the screen so corners are easier to place.',
  'Reduce glare and reflections for cleaner edges.',
  'Pinch to zoom and drag corners precisely on the adjust screen.',
];

export default function OnboardingModal({ visible, onComplete }: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.accentRow}>
            <View style={[styles.accent, { backgroundColor: colors.neon.magenta }]} />
            <View style={[styles.accent, { backgroundColor: colors.neon.cyan }]} />
            <View style={[styles.accent, { backgroundColor: colors.neon.lime }]} />
            <View style={[styles.accent, { backgroundColor: colors.neon.violet }]} />
          </View>

          <Text style={styles.title}>Welcome to Pixel It</Text>
          <Text style={styles.subtitle}>
            Flatten photos of any screen into a clean, screenshot-like image.
          </Text>

          <View style={styles.tips}>
            {TIPS.map((tip) => (
              <View key={tip} style={styles.tipRow}>
                <View style={styles.bullet} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <AppButton label="Get started" onPress={onComplete} />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
  },
  accentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
    width: 80,
  },
  accent: {
    flex: 1,
    height: 4,
    borderRadius: radii.full,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  tips: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  tipText: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
});
