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
    <View className="flex-row items-center p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-3 text-gray-900 dark:text-gray-100 mr-2"
        multiline
        maxLength={10000}
        onSubmitEditing={disabled ? undefined : handleSend}
        submitBehavior="submit"
      />
      <Pressable
        onPress={handleSend}
        disabled={!message.trim() || disabled}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          message.trim() && !disabled
            ? "bg-blue-500"
            : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <Send
          size={20}
          color={message.trim() && !disabled ? "white" : "#9ca3af"}
        />
      </Pressable>
    </View>
  );
}
