import { View } from "react-native";
import type { Part, ToolPart } from "@opencode-ai/sdk/v2";

import { MarkdownContent } from "./MarkdownContent";
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
        <MarkdownContent content={part.text.trim()} isUser={isUser} />
      </View>
    );
  }

  if (part.type === "tool") {
    return (
      <View className="w-full">
        <ToolInvocation part={part as ToolPart} />
      </View>
    );
  }

  return null;
}
