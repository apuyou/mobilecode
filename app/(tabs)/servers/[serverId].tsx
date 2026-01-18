import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { ServerContent } from "@/components/ServerContent";
import { useAppStore } from "@/stores";

export default function SessionListScreen() {
  const { serverId } = useLocalSearchParams<{ serverId: string }>();
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

  return <ServerContent server={server} />;
}
