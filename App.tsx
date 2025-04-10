import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary'; // Adjusted path to match likely casing
import { ThemeProvider } from './components/ThemeProvider'; // Added ThemeProvider

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary> {/* Wrap the app in an error boundary */}
        <ThemeProvider> {/* Provide a consistent theme */}
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1 }}>
              <StatusBar style="auto" />
              {/* Your app content will go here */}
            </SafeAreaView>
          </NavigationContainer>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}