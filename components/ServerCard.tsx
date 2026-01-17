import { View, Text, Pressable } from "react-native";
import { Server as ServerIcon, WifiOff } from "lucide-react-native";

import type { Server } from "@/stores";

interface ServerCardProps {
  server: Server;
  onPress: () => void;
}

export function ServerCard({ server, onPress }: ServerCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg items-center justify-center mr-3">
            <ServerIcon size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900 dark:text-white">
              {server.name}
            </Text>
            <Text
              className="text-sm text-gray-500 dark:text-gray-400 mt-0.5"
              numberOfLines={1}
            >
              {server.url}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
