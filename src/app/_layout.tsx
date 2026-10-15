import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSettingsStore } from '@/store/useSettingsStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const tactileEffects = useSettingsStore((state) => state.tactileEffects);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {Platform.OS === 'web' && (
        <style
          // @ts-ignore
          dangerouslySetInnerHTML={{
            __html: tactileEffects
              ? `
                [role="button"]:active,
                button:active {
                  transform: translateY(3px) !important;
                  border-bottom-width: 2px !important;
                }
              `
              : `
                [role="button"]:active,
                button:active {
                  transform: none !important;
                }
              `,
          }}
        />
      )}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="class-manager" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
