import { router } from "expo-router";
import { ChevronDown, Send } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { ModelInfo } from "@/hooks/useModels";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  selectedAgent: string;
  selectedModel: ModelInfo | undefined;
}

export function MessageInput({
  onSend,
  disabled,
  selectedAgent,
  selectedModel,
}: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <View className="px-4 pt-2 pb-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <View className="bg-gray-100 dark:bg-gray-900 rounded-2xl">
        <View className="flex-row items-end px-4 py-2">
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Ask anything..."
            className="flex-1 self-start text-base text-gray-900 dark:text-gray-100 p-0 m-0"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={10000}
            submitBehavior="newline"
          />
          <Pressable
            onPress={handleSend}
            disabled={!message.trim() || disabled}
            className={`w-8 h-8 rounded-full items-center justify-center ml-2 mb-0.5 ${
              message.trim() && !disabled
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <Send
              size={16}
              color={message.trim() && !disabled ? "white" : "#9ca3af"}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center px-3 pb-2 pt-0.5 gap-1">
          <Pressable
            onPress={() => router.push("/picker/agent")}
            className="flex-row items-center px-2 py-1 rounded-lg active:bg-gray-200 dark:active:bg-gray-800"
          >
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {selectedAgent}
            </Text>
            <ChevronDown size={14} color="#9ca3af" className="ml-0.5" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/picker/model")}
            className="flex-row items-center px-2 py-1 rounded-lg active:bg-gray-200 dark:active:bg-gray-800 shrink min-w-0 gap-1.5"
          >
            {selectedModel && (
              <View className="w-4 h-4 rounded bg-gray-600 dark:bg-gray-400 items-center justify-center">
                <Text className="text-[10px] font-bold text-white dark:text-gray-900 leading-tight">
                  {selectedModel.providerID.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text
              className="text-sm text-gray-600 dark:text-gray-400 shrink min-w-0"
              numberOfLines={1}
            >
              {selectedModel?.name || "Select model"}
            </Text>
            <ChevronDown
              size={14}
              color="#9ca3af"
              className="ml-0.5 shrink-0"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
