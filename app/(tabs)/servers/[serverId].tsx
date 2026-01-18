import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useEffect } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ProjectSessions } from "@/components/ProjectSessions";
import { createClient } from "@/lib/opencode-client";
import { useAppStore } from "@/stores";

interface Project {
  id: string;
  name: string;
  path: string;
}

export default function SessionListScreen() {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const servers = useAppStore((s) => s.servers);
  const removeServer = useAppStore((s) => s.removeServer);
  const server = servers.find((s) => s.id === serverId);

  const {
    data: projects = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["server", server?.url, "projects"],
    queryFn: async () => {
      if (!server) {
        throw new Error("Server not found");
      }

      const client = createClient(server.url);
      const projectsResult = await client.project.list();

      return projectsResult.data || [];
    },
    select: (data) => {
      return data.map((proj) => ({
        id: proj.id,
        name: proj.worktree?.split("/").pop() || proj.id,
        path: proj.worktree || proj.id,
      }));
    },
    enabled: !!server,
  });

  useEffect(() => {
    if (server && projects.length !== undefined) {
      navigation.setOptions({
        title: `${server.name} • ${projects.length} ${projects.length === 1 ? "project" : "projects"}`,
      });
    }
  }, [navigation, server, projects.length]);

  const handleRefresh = () => {
    if (!server) {
      return;
    }

    queryClient.invalidateQueries({
      queryKey: ["server", server.url],
    });
  };

  const handleDeleteServer = () => {
    if (!server) {
      return;
    }

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

  if (!server) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">
          Server not found
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={isFetching} onRefresh={handleRefresh} />
      }
    >
      <View className="p-4">
        {/* Connection Error */}
        {error && (
          <View className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 mb-4">
            <Text className="text-red-600 dark:text-red-400">
              {(error as Error).message}
            </Text>
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View className="py-12 items-center">
            <Text className="text-gray-500 dark:text-gray-400 mt-3">
              Loading projects...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && !error && (
          <View className="py-12 items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              No projects found.
            </Text>
          </View>
        )}

        {/* Projects List */}
        {projects.map((project) => (
          <ProjectSessions
            key={project.id}
            project={project}
            serverUrl={server.url}
          />
        ))}

        {/* Server Info */}
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 mt-8">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            Server URL
          </Text>
          <Text className="text-base text-gray-900 dark:text-white mt-1">
            {server.url}
          </Text>
        </View>

        {/* Delete Server Button */}
        <Pressable
          onPress={handleDeleteServer}
          className="mt-8 bg-red-50 dark:bg-red-900/30 rounded-xl p-4 flex-row items-center justify-center"
        >
          <Trash2 size={20} color="#ef4444" />
          <Text className="text-red-500 ml-3 font-medium">Delete Server</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
