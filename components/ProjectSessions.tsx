import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Folder } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { SessionCard } from "@/components/SessionCard";
import { getClient } from "@/lib/opencode-client";

interface Session {
  id: string;
  title: string;
  status: "idle" | "busy" | "retry";
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  path: string;
}

interface ProjectSessionsProps {
  project: Project;
  serverUrl: string;
}

async function fetchProjectSessions({
  queryKey,
}: {
  queryKey: readonly [string, string, string];
}): Promise<Session[]> {
  const [, serverUrl, projectPath] = queryKey;
  const client = getClient(serverUrl);

  // Get sessions filtered by directory
  const sessionsResult = await client.getClient().session.list({
    query: { directory: projectPath },
  });

  if (sessionsResult.error) {
    throw sessionsResult.error;
  }

  if (
    !sessionsResult.data ||
    !Array.isArray(sessionsResult.data) ||
    sessionsResult.data.length === 0
  ) {
    return [];
  }

  // Get session statuses
  const statusResult = await client.getClient().session.status();
  const statuses = statusResult.data?.statuses || {};

  const mappedSessions: Session[] = sessionsResult.data.map((s: any) => ({
    id: s.id,
    title: s.title || s.slug || `Session ${s.id.slice(0, 8)}`,
    status: statuses[s.id] || ("idle" as const),
    updatedAt: new Date(s.time.updated).toISOString(),
  }));

  return mappedSessions;
}

export function ProjectSessions({ project, serverUrl }: ProjectSessionsProps) {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const [showAll, setShowAll] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions", serverUrl, project.path] as const,
    queryFn: fetchProjectSessions,
  });

  if (isLoading) {
    return (
      <View className="mb-6">
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

  if (sessions.length === 0) {
    return null;
  }

  const displayedSessions = showAll ? sessions : sessions.slice(0, 3);
  const hasMore = sessions.length > 3;

  return (
    <View className="mb-6">
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

      {/* Sessions for this project */}
      {displayedSessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onPress={() =>
            router.push(`/server/${serverId}/session/${session.id}`)
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
