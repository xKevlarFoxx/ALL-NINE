import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { LocalizationService } from './services/localization/LocalizationService';
import { performanceService } from './services/optimization/PerformanceService';
import { paymentService } from './services/payments/PaymentService';
import { verificationService } from './services/verification/VerificationService';
import { analyticsService, AnalyticsEvent } from './services/analytics/AnalyticsService';

export default function App() {
  // Initialize services
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize in parallel where possible
        await Promise.all([
          LocalizationService.initialize(),
          performanceService.initialize(),
        ]);

        // Sequential initialization for services that might depend on others
        await verificationService.initialize();
        
        // Track app launch
        analyticsService.track('App_Launched' as AnalyticsEvent, {
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Service initialization failed:', error);
        // Continue app launch even if some services fail
      }
    };

    initializeServices();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
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