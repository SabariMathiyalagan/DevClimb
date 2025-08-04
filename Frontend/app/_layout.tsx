import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // index.tsx is now the default welcome screen
  initialRouteName: 'index',
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
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        {/* Welcome Screen (Default Route) */}
          <Stack.Screen name="index" options={{ headerShown: false, title: '' }} />
        
        {/* Onboarding Flow */}
        <Stack.Screen name="onboarding/signup" options={{ title: "Sign Up", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="onboarding/upload-resume" options={{ title: "Upload Resume", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="onboarding/loading" options={{ headerShown: false }} />
        
        {/* Main App */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modal Screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: "AI Coach" }} />
        
        {/* Additional Screens */}
        <Stack.Screen name="quest-detail" options={{ title: "Quest Details", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="submit-project" options={{ title: "Submit Project", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="project-review" options={{ title: "Project Review", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="progress-tracker" options={{ title: "Progress Tracker", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="resume-update" options={{ title: "Update Resume", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
        <Stack.Screen name="error" options={{ title: "Error", headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      </Stack>
    </ThemeProvider>
  );
}
