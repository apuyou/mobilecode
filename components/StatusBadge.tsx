import { View, Text } from "react-native";

interface StatusBadgeProps {
  status: "idle" | "busy" | "retry" | "connecting" | "connected" | "error";
  size?: "sm" | "md";
}

const statusConfig = {
  idle: {
    bg: "bg-gray-500",
    text: "Idle",
  },
  busy: {
    bg: "bg-yellow-500",
    text: "Busy",
  },
  retry: {
    bg: "bg-orange-500",
    text: "Retry",
  },
  connecting: {
    bg: "bg-blue-500",
    text: "Connecting",
  },
  connected: {
    bg: "bg-green-500",
    text: "Connected",
  },
  error: {
    bg: "bg-red-500",
    text: "Error",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.idle;
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <View className={`${config.bg} ${sizeClasses} rounded-full`}>
      <Text className={`${textSize} text-white font-medium`}>
        {config.text}
      </Text>
    </View>
  );
}
