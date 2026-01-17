import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { CheckCircle, Server, XCircle } from "lucide-react-native";

import { useTestConnection } from "@/hooks/useTestConnection";
import { useAppStore } from "@/stores";

export default function AddServerScreen() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const addServer = useAppStore((s) => s.addServer);
  const { testing, testResult, error, testConnection, reset } =
    useTestConnection();

  const handleSave = () => {
    if (!name.trim()) {
      setValidationError("Please enter a server name");
      return;
    }
    if (!url.trim()) {
      setValidationError("Please enter a server URL");
      return;
    }

    addServer({
      name: name.trim(),
      url: url.trim(),
      connectionMode: "direct",
    });

    router.back();
  };

  const handleUrlChange = (text: string) => {
    setUrl(text);
    reset();
    setValidationError(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="p-4">
          {/* Server Icon */}
          <View className="items-center py-6">
            <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-2xl items-center justify-center">
              <Server size={40} color="#3b82f6" />
            </View>
          </View>

          {/* Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Server Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="My Dev Machine"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            />
          </View>

          {/* URL Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Server URL
            </Text>
            <TextInput
              value={url}
              onChangeText={handleUrlChange}
              placeholder="http://192.168.1.100:4001"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-base text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
            />
          </View>

          {/* Test Connection Button */}
          <Pressable
            onPress={() => testConnection(url)}
            disabled={testing}
            className="bg-gray-200 dark:bg-gray-700 rounded-xl py-3 flex-row items-center justify-center mb-4"
          >
            {testing ? (
              <ActivityIndicator size="small" color="#6b7280" />
            ) : testResult === "success" ? (
              <>
                <CheckCircle size={20} color="#22c55e" />
                <Text className="text-green-600 dark:text-green-400 font-medium ml-2">
                  Connection Successful
                </Text>
              </>
            ) : testResult === "error" ? (
              <>
                <XCircle size={20} color="#ef4444" />
                <Text className="text-red-500 font-medium ml-2">
                  Connection Failed
                </Text>
              </>
            ) : (
              <Text className="text-gray-700 dark:text-gray-300 font-medium">
                Test Connection
              </Text>
            )}
          </Pressable>

          {/* Error Message */}
          {(error || validationError) && (
            <View className="bg-red-50 dark:bg-red-900/30 rounded-xl p-3 mb-4">
              <Text className="text-red-600 dark:text-red-400 text-sm">
                {error || validationError}
              </Text>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            className="bg-blue-500 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-semibold text-base">
              Add Server
            </Text>
          </Pressable>

          {/* Help Text */}
          <View className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5">
              Enter the URL where your OpenCode server is running. This is
              typically http://localhost:4001 on your development machine, or
              use your machine's IP address if connecting over a network.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
