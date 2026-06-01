import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdjustScreen from '../screens/AdjustScreen';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import { colors, typography } from '../theme';
import type { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerTint,
        headerTitleStyle: {
          ...typography.headline,
          color: colors.text,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
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
