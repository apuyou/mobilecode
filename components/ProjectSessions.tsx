import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, ChevronUp, Folder } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { SessionCard } from "@/components/SessionCard";
import { useSessions } from "@/hooks/useSessions";

interface Project {
  id: string;
  name: string;
  path: string;
}

interface ProjectSessionsProps {
  project: Project;
  serverUrl: string;
}

export function ProjectSessions({ project, serverUrl }: ProjectSessionsProps) {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
  const [showAll, setShowAll] = useState(false);

  const { data: sessions = [], isLoading } = useSessions(
    serverUrl,
    project.path,
  );

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
