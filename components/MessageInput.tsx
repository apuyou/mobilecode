import { Send } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <View className="px-4 pt-2 pb-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <View className="flex-row items-end bg-gray-100 dark:bg-gray-900 rounded-3xl px-4 py-2">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
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
    </View>
  );
}
