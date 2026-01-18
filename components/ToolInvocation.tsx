import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { StatusBadge } from "./StatusBadge";

interface ToolInvocationProps {
  toolName: string;
  input: unknown;
  output?: unknown;
  status: string;
}

export function ToolInvocation({
  toolName,
  input,
  output,
  status,
}: ToolInvocationProps) {
  const [expanded, setExpanded] = useState(false);

  // Map tool status to StatusBadge status
  const badgeStatus = (): "idle" | "busy" | "retry" | "error" => {
    if (status === "success" || status === "complete") {
      return "idle";
    }

    if (status === "running" || status === "pending") {
      return "busy";
    }

    if (status === "error" || status === "failed") {
      return "error";
    }

    return "idle";
  };

  return (
    <View className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="p-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100 mr-2">
            {toolName}
          </Text>
          <StatusBadge status={badgeStatus()} />
        </View>
        {expanded ? (
          <ChevronUp size={16} color="#6b7280" />
        ) : (
          <ChevronDown size={16} color="#6b7280" />
        )}
      </Pressable>

      {expanded && (
        <View className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
          {input && (
            <View className="mt-2">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Input:
              </Text>
              <View className="bg-white dark:bg-gray-800 rounded p-2">
                <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">
                  {JSON.stringify(input, null, 2)}
                </Text>
              </View>
            </View>
          )}

          {output && (
            <View className="mt-2">
              <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Output:
              </Text>
              <View className="bg-white dark:bg-gray-800 rounded p-2">
                <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">
                  {JSON.stringify(output, null, 2)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
