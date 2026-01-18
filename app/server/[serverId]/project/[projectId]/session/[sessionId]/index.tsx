import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { SessionChatContent } from "@/components/SessionChatContent";
import { useAppStore } from "@/stores";

export default function SessionChatScreen() {
  const { serverId, sessionId, projectId } = useLocalSearchParams<{
    serverId: string;
    sessionId: string;
    projectId: string;
  }>();
  const servers = useAppStore((s) => s.servers);
  const server = servers.find((s) => s.id === serverId);

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
    <SessionChatContent
      server={server}
      sessionId={sessionId}
      projectId={projectId}
    />
  );
}
