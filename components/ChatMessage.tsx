import { Text, View } from "react-native";
import type { Message, Part } from "@opencode-ai/sdk";

import { ToolInvocation } from "./ToolInvocation";

interface ChatMessageProps {
  message: {
    info: Message;
    parts: Part[];
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (
    message.info.role === "assistant" &&
    message.info.error &&
    message.parts.length === 0
  ) {
    return (
      <View className="mb-4 items-start">
        <View className="max-w-[80%] rounded-2xl px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <View>
            <Text className="text-base font-semibold text-red-600 dark:text-red-400 mb-1">
              {message.info.error.name}
            </Text>
            {typeof message.info.error.data.message === "string" && (
              <Text className="text-sm text-red-700 dark:text-red-300">
                {message.info.error.data.message}
              </Text>
            )}
          </View>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
          {new Date(message.info.time.created).toLocaleTimeString()}
        </Text>
      </View>
    );
  }

  const isUser = message.info.role === "user";

  return (
    <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        }`}
      >
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <Text
                key={index}
                className={`text-base ${
                  isUser ? "text-white" : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {part.text}
              </Text>
            );
          }

          if (part.type === "tool") {
            return (
              <ToolInvocation
                key={index}
                toolName={part.tool || "Unknown Tool"}
                input={part.state?.input}
                output={
                  part.state?.status === "completed"
                    ? part.state.output
                    : undefined
                }
                status={part.state?.status || "unknown"}
              />
            );
          }

          return null;
        })}
      </View>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
        {new Date(message.info.time.created).toLocaleTimeString()}
      </Text>
    </View>
  );
}
