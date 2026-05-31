import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdjustScreen from '../screens/AdjustScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Pixel It' }}
      />
      <Stack.Screen
        name="Adjust"
        component={AdjustScreen}
        options={{ title: 'Adjust Corners' }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: 'Result' }}
      />
    </Stack.Navigator>
  );
}
