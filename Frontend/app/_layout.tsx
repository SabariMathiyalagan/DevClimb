import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Start with onboarding flow, then navigate to main app
  initialRouteName: 'onboarding/welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Onboarding Flow */}
        <Stack.Screen name="onboarding/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/signup" options={{ title: "Sign Up", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="onboarding/upload-resume" options={{ title: "Upload Resume", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="onboarding/loading" options={{ headerShown: false }} />
        
        {/* Main App */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modal Screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: "AI Coach" }} />
        
        {/* Additional Screens */}
        <Stack.Screen name="quest-detail" options={{ title: "Quest Details", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="submit-project" options={{ title: "Submit Project", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="project-review" options={{ title: "Project Review", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="progress-tracker" options={{ title: "Progress Tracker", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="final-report" options={{ title: "Final Report", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="resume-update" options={{ title: "Update Resume", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
        <Stack.Screen name="error" options={{ title: "Error", headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#F5F5F5' }} />
      </Stack>
    </ThemeProvider>
  );
}
