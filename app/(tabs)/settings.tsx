import * as Application from "expo-application";
import * as Updates from "expo-updates";
import { ExternalLink, Info, Trash2 } from "lucide-react-native";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAllSessions } from "@/hooks/useAllSessions";
import { useAppStore } from "@/stores";

export default function SettingsScreen() {
  const servers = useAppStore((s) => s.servers);
  const clearAllData = useAppStore((s) => s.clearAllData);
  const { recentSessions } = useAllSessions(servers);
  const projectCount = new Set(recentSessions.map((s) => s.projectId)).size;

  const version = Application.nativeApplicationVersion || "Unknown";
  const buildNumber = Application.nativeBuildVersion || "Unknown";
  const updateId = Updates.updateId || "embedded";

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will remove all servers and cached data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAllData();
            Alert.alert("Data Cleared", "All data has been removed.");
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        {/* App Info */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Info size={20} color="#3b82f6" />
            <Text className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              About
            </Text>
          </View>
          <Text className="text-gray-600 dark:text-gray-300 mb-2">
            MobileCode
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Version: {version} ({buildNumber})
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Update: {updateId}
          </Text>
        </View>

        {/* Stats */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Statistics
          </Text>
          <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-300">
              Servers
            </Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {servers.length}
            </Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-300">Projects</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {projectCount}
            </Text>
          </View>
          <View className="flex-row justify-between py-2 border-b border-gray-100 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-300">Sessions</Text>
            <Text className="text-gray-900 dark:text-white font-medium">
              {recentSessions.length}
            </Text>
          </View>
        </View>

        {/* Links */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Resources
          </Text>
          <Pressable
            onPress={() =>
              Linking.openURL("https://opencode.ai/docs")
            }
            className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700"
          >
            <Text className="text-gray-600 dark:text-gray-300">
              OpenCode Documentation
            </Text>
            <ExternalLink size={18} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
          <Text className="text-lg font-semibold text-red-500 mb-3">
            Danger Zone
          </Text>
          <Pressable
            onPress={handleClearData}
            className="flex-row items-center py-3"
          >
            <Trash2 size={20} color="#ef4444" />
            <Text className="text-red-500 ml-3">Clear All Data</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
