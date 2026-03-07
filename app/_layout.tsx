import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StrictMode, useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { useColorScheme } from "@/components/useColorScheme";
import { useReactQuerySetup } from "@/hooks/useReactQuerySetup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      gcTime: 1000 * 60 * 60 * 24 * 365,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useReactQuerySetup();

  useEffect(() => {
    if (error) {
      throw error;
    }
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
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="server/new"
              options={{
                presentation: "modal",
                title: "Add Server",
              }}
            />
            <Stack.Screen
              name="server/[serverId]/project/[projectId]/session/[sessionId]/index"
              options={{
                title: "Chat",
              }}
            />
            <Stack.Screen
              name="picker/agent"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.35],
                sheetGrabberVisible: true,
                title: "Select Mode",
              }}
            />
            <Stack.Screen
              name="picker/model"
              options={{
                presentation: "formSheet",
                sheetAllowedDetents: [0.5, 0.75],
                sheetGrabberVisible: true,
                title: "Select Model",
              }}
            />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
