import { Text, View } from "react-native";
import type { Part } from "@opencode-ai/sdk";

import { ToolInvocation } from "./ToolInvocation";

interface ChatMessagePartProps {
  part: Part;
  isUser: boolean;
}

export function ChatMessagePart({ part, isUser }: ChatMessagePartProps) {
  if (part.type === "text") {
    if (!part.text || part.text.trim() === "") {
      return null;
    }

    return (
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-500"
            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        }`}
      >
        <Text
          className={`text-base ${
            isUser ? "text-white" : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {part.text.trim()}
        </Text>
      </View>
    );
  }

  if (part.type === "tool") {
    return (
      <ToolInvocation
        toolName={part.tool || "Unknown Tool"}
        input={part.state?.input}
        output={
          part.state?.status === "completed" ? part.state.output : undefined
        }
        status={part.state?.status || "unknown"}
      />
    );
  }

  return null;
}
