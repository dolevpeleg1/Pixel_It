import * as Haptics from 'expo-haptics';

export function hapticSuccess(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function hapticLight(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
