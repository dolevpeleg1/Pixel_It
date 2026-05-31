import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Adjust'>;

export default function AdjustScreen({ navigation, route }: Props) {
  const { photoUri } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Photo URI (placeholder)</Text>
      <Text style={styles.uri}>{photoUri}</Text>
      <Text style={styles.hint}>Corner adjustment UI will be added in Step 3.</Text>
      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate('Result', {
            originalUri: photoUri,
            processedUri: photoUri,
          })
        }
      >
        <Text style={styles.buttonText}>Demo: View Result</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  uri: {
    fontSize: 14,
    color: '#111',
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
