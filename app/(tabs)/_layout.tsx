import { Tabs } from "expo-router";
import { Home, Server, Settings } from "lucide-react-native";

import { useColorScheme } from "@/components/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: isDark ? "#9ca3af" : "#6b7280",
        tabBarStyle: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
          borderTopColor: isDark ? "#374151" : "#e5e7eb",
        },
        headerStyle: {
          backgroundColor: isDark ? "#1f2937" : "#ffffff",
        },
        headerTintColor: isDark ? "#ffffff" : "#111827",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="servers"
        options={{
          title: "Servers",
          tabBarIcon: ({ color, size }) => <Server size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
