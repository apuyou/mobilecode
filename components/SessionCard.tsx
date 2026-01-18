import { Pressable, Text, View } from "react-native";
import { MessageSquare } from "lucide-react-native";

import { formatTimeAgo } from "@/lib/formatTimeAgo";

interface SessionCardProps {
  title: string;
  updatedAt: string;
  onPress: () => void;
}

export function SessionCard({ title, updatedAt, onPress }: SessionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg items-center justify-center mr-3">
          <MessageSquare size={20} color="#a855f7" />
        </View>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900 dark:text-white"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {formatTimeAgo(updatedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
