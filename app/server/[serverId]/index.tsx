import { router, Stack, useLocalSearchParams } from "expo-router";
import { Trash2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { ProjectSessions } from "@/components/ProjectSessions";
import { getClient } from "@/lib/opencode-client";
import { useAppStore } from "@/stores";

interface Project {
  id: string;
  name: string;
  path: string;
}

export default function SessionListScreen() {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const servers = useAppStore((s) => s.servers);
  const removeServer = useAppStore((s) => s.removeServer);
  const server = servers.find((s) => s.id === serverId);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const loadProjects = useCallback(async () => {
    if (!server) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = getClient(server.url);

      // Get all projects
      try {
        const projectsResult = await client.getClient().project.list();

        if (projectsResult.error) {
          setError(
            (projectsResult.error as Error).message ||
              "Failed to load projects",
          );
          setProjects([]);
          return;
        }

        if (!projectsResult.data || !Array.isArray(projectsResult.data)) {
          setProjects([]);
          return;
        }

        // Map projects
        const mappedProjects = projectsResult.data.map((proj: any) => ({
          id: proj.id,
          name:
            proj.id === "global"
              ? "Global"
              : proj.worktree?.split("/").pop() || "Unnamed Project",
          path: proj.worktree || proj.id,
        }));

        setProjects(mappedProjects);
      } catch (error) {
        setError((error as Error).message || "Failed to load projects");
        setProjects([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [server]);

  const handleRefresh = useCallback(() => {
    loadProjects();
    setRefreshKey((prev) => prev + 1);
  }, [loadProjects]);

  useEffect(() => {
    if (server) {
      loadProjects();
    }
  }, [server?.id]);

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
    <>
      <Stack.Screen
        options={{
          title: `${server.name} • ${projects.length} ${projects.length === 1 ? "project" : "projects"}`,
        }}
      />
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {/* Connection Error */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/30 rounded-xl p-4 mb-4">
              <Text className="text-red-600 dark:text-red-400">{error}</Text>
            </View>
          )}

          {/* Loading State */}
          {loading && projects.length === 0 && (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 dark:text-gray-400 mt-3">
                Loading projects...
              </Text>
            </View>
          )}

          {/* Empty State */}
          {!loading && projects.length === 0 && !error && (
            <View className="py-12 items-center">
              <Text className="text-gray-500 dark:text-gray-400 text-center">
                No projects found.
              </Text>
            </View>
          )}

          {/* Projects List */}
          {projects.map((project) => (
            <ProjectSessions
              key={`${project.id}-${refreshKey}`}
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
    </>
  );
}
