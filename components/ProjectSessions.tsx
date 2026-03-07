import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Folder, Plus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { SessionCard } from "@/components/SessionCard";
import { useSessions } from "@/hooks/useSessions";
import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

interface Project {
  id: string;
  name: string;
  path: string;
}

interface ProjectSessionsProps {
  project: Project;
  server: Server;
}

export function ProjectSessions({ project, server }: ProjectSessionsProps) {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useSessions(
    server,
    project.path,
  );

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        directory: project.path,
        username: server.username,
        password: server.password,
      });
      const result = await client.session.create({
        directory: project.path,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "project", project.path, "sessions"],
      });
      if (session) {
        router.push(
          `/server/${serverId}/project/${project.id}/session/${session.id}`,
        );
      }
    },
  });

  if (isLoading) {
    return (
      <View>
        <View className="mb-3">
          <View className="flex-row items-center">
            <Folder size={16} color="#6b7280" />
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
              {project.name}
            </Text>
          </View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 ml-6">
            {project.path}
          </Text>
        </View>
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#6b7280" />
        </View>
      </View>
    );
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 3);
  const hasMore = sessions.length > 3;

  return (
    <View>
      {/* Project Header */}
      <View className="mb-3">
        <View className="flex-row items-center">
          <Folder size={16} color="#6b7280" />
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-2">
            {project.name}
          </Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 ml-6">
          {project.path}
        </Text>
      </View>

      {/* New Session Button */}
      <Pressable
        onPress={() => createSessionMutation.mutate()}
        disabled={createSessionMutation.isPending}
        className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 flex-row items-center mb-2"
      >
        {createSessionMutation.isPending ? (
          <ActivityIndicator size="small" color="#3b82f6" />
        ) : (
          <Plus size={18} color="#3b82f6" />
        )}
        <Text className="text-blue-600 dark:text-blue-400 ml-2 text-sm font-medium">
          New Session
        </Text>
      </Pressable>

      {/* Sessions for this project */}
      {displayedSessions.map((session) => (
        <SessionCard
          key={session.id}
          title={session.title}
          updatedAt={session.updatedAt}
          onPress={() =>
            router.push(
              `/server/${serverId}/project/${project.id}/session/${session.id}`,
            )
          }
        />
      ))}

      {/* View More/Less Button */}
      {hasMore && (
        <Pressable
          onPress={() => setShowAll(!showAll)}
          className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 flex-row items-center justify-center mt-2"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} color="#6b7280" />
              <Text className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
                Show less
              </Text>
            </>
          ) : (
            <>
              <ChevronDown size={16} color="#6b7280" />
              <Text className="text-gray-600 dark:text-gray-400 ml-2 text-sm">
                View {sessions.length - 3} more
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}
