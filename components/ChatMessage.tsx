import { Text, View } from "react-native";

import { ToolInvocation } from "./ToolInvocation";
import { Message } from "@/lib/types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

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
                {part.content}
              </Text>
            );
          }

          if (part.type === "tool-invocation") {
            return (
              <ToolInvocation
                key={index}
                toolName={part.toolName}
                input={part.input}
                output={part.output}
                status={part.status}
              />
            );
          }

          return null;
        })}
      </View>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
        {new Date(message.createdAt).toLocaleTimeString()}
      </Text>
    </View>
  );
}
