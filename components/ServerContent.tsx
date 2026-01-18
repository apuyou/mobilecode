import { useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useEffect } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { ProjectSessions } from "@/components/ProjectSessions";
import { useProjects } from "@/hooks/useProjects";
import { Server, useAppStore } from "@/stores";

interface ServerContentProps {
  server: Server;
}

export function ServerContent({ server }: ServerContentProps) {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const removeServer = useAppStore((s) => s.removeServer);

  const {
    data: projects = [],
    isLoading,
    isFetching,
    error,
  } = useProjects(server.url);

  useEffect(() => {
    navigation.setOptions({
      title: server.name,
    });
  }, [navigation, server]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["server", server.url],
    });
  };

  const handleDeleteServer = () => {
    Alert.alert(
      "Delete Server",
      `Are you sure you want to remove "${server.name}"? This will not delete any data on the server.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeServer(server.id);
            router.back();
          },
        },
      ],
    );
  };

  return (
    <FlatList
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={projects}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ProjectSessions project={item} serverUrl={server.url} />
      )}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        error ? (
          <View className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 mb-4">
            <Text className="text-red-600 dark:text-red-400">
              {error.message}
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="py-12 items-center">
            <Text className="text-gray-500 dark:text-gray-400 mt-3">
              Loading projects...
            </Text>
          </View>
        ) : (
          <View className="py-12 items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              No projects found.
            </Text>
          </View>
        )
      }
      ListFooterComponent={
        <>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 mt-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Server URL
            </Text>
            <Text className="text-base text-gray-900 dark:text-white mt-1">
              {server.url}
            </Text>
          </View>

          <Pressable
            onPress={handleDeleteServer}
            className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 flex-row items-center justify-center"
          >
            <Trash2 size={20} color="#ef4444" />
            <Text className="text-red-500 ml-3 font-medium">Delete Server</Text>
          </Pressable>
        </>
      }
    />
  );
}
