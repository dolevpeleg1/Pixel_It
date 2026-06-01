import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden during fast refresh.
});

export default function App() {
  const [navigationReady, setNavigationReady] = useState(false);

  useEffect(() => {
    if (navigationReady) {
      void SplashScreen.hideAsync();
    }
  }, [navigationReady]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer onReady={() => setNavigationReady(true)}>
          <AppNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
