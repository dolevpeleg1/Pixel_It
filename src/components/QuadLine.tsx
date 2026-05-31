import { StyleSheet, View } from 'react-native';
import type { Point } from '../types';

type Props = {
  from: Point;
  to: Point;
};

const LINE_HEIGHT = 2;

export default function QuadLine({ from, to }: Props) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);

  if (length < 1) {
    return null;
  }

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.line,
        {
          left: from.x,
          top: from.y - LINE_HEIGHT / 2,
          width: length,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    height: LINE_HEIGHT,
    backgroundColor: '#007AFF',
    transformOrigin: 'left center',
  },
});
