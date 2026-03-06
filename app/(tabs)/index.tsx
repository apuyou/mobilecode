import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { useAllSessions } from "@/hooks/useAllSessions";
import { formatTimeAgo } from "@/lib/formatTimeAgo";
import { useAppStore } from "@/stores";

export default function RecentsScreen() {
  const queryClient = useQueryClient();
  const servers = useAppStore((s) => s.servers);
  const { recentSessions, isLoading } = useAllSessions(servers);

  const handleRefresh = () => {
    servers.forEach((server) => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url],
      });
    });
  };

  return (
    <FlatList
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={recentSessions}
      keyExtractor={(item) =>
        `${item.serverId}-${item.projectId}-${item.sessionId}`
      }
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
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
