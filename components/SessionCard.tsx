import { View, Text, Pressable } from "react-native";
import { MessageSquare } from "lucide-react-native";
import { StatusBadge } from "./StatusBadge";
import type { Session } from "@/lib/types";

interface SessionCardProps {
  session: Session;
  onPress: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm active:opacity-80"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg items-center justify-center mr-3">
            <MessageSquare size={20} color="#a855f7" />
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-semibold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {session.title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {formatTimeAgo(session.updatedAt)}
            </Text>
          </View>
        </View>
        <StatusBadge status={session.status} size="sm" />
      </View>
    </Pressable>
  );
}
