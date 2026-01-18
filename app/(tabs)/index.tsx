import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

import { useAllSessions } from "@/hooks/useAllSessions";
import { useAppStore } from "@/stores";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "Just now";
  }

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return date.toLocaleDateString();
}

export default function RecentsScreen() {
  const servers = useAppStore((s) => s.servers);
  const { recentSessions, isLoading } = useAllSessions(servers);

  return (
    <FlatList
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={recentSessions}
      keyExtractor={(item) => `${item.serverId}-${item.sessionId}`}
      renderItem={({ item }) => (
        <Pressable
          onPress={() =>
            router.push(
              `/server/${item.serverId}/project/${item.projectId}/session/${item.sessionId}`,
            )
          }
          className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
        >
          <View className="flex-row items-center">
            <View
              className="w-10 h-10 rounded-lg items-center justify-center mr-3"
              style={{
                backgroundColor: item.projectIcon?.color || "#e0e7ff",
              }}
            >
              {item.projectIcon?.url ? (
                <Image
                  source={{ uri: item.projectIcon.url }}
                  style={{ width: 32, height: 32 }}
                />
              ) : (
                <Text className="text-2xl">📁</Text>
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-base font-semibold text-gray-900 dark:text-white"
                numberOfLines={1}
              >
                {item.sessionTitle}
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {item.projectName} • {item.serverName}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {formatTimeAgo(item.updatedAt)}
              </Text>
            </View>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        isLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-500 dark:text-gray-400 mt-3">
              Loading recent sessions...
            </Text>
          </View>
        ) : (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              No recent sessions.{"\n"}Start a conversation to see it here.
            </Text>
          </View>
        )
      }
    />
  );
}
