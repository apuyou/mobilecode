import { Text, View } from "react-native";
import type { Message, Part } from "@opencode-ai/sdk/v2";

import { ChatMessagePart } from "./ChatMessagePart";

interface ChatMessageProps {
  message: {
    info: Message;
    parts: Part[];
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.info.role === "user";
  const isAssistantTyping =
    message.info.role === "assistant" && !message.info.finish;

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

  return (
    <View className={`mb-4 ${isUser ? "items-end" : "items-start"}`}>
      {message.parts.map((part, index) => (
        <ChatMessagePart key={index} part={part} isUser={isUser} />
      ))}
      {message.parts.length > 0 && (
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
          {new Date(message.info.time.created).toLocaleTimeString()}
        </Text>
      )}
      {isAssistantTyping && (
        <View className="flex-row items-center gap-1 mt-6 px-2">
          <View className="w-2 h-2 rounded-full bg-gray-400" />
          <View className="w-2 h-2 rounded-full bg-gray-400" />
          <View className="w-2 h-2 rounded-full bg-gray-400" />
        </View>
      )}
    </View>
  );
}
