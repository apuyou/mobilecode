import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createClient } from "@/lib/opencode-client";
import { useAppStore } from "@/stores";

export default function SessionSettingsScreen() {
  const { serverId, sessionId } = useLocalSearchParams<{
    serverId: string;
    sessionId: string;
  }>();

  const servers = useAppStore((s) => s.servers);
  const server = servers.find((s) => s.id === serverId);

  const { data: messages = [] } = useQuery({
    queryKey: ["server", server?.url, "session", sessionId, "messages"],
    queryFn: async () => {
      if (!server || !sessionId) {
        throw new Error("Server or session not found");
      }

      const client = createClient(server.url);
      const messagesResult = await client.session.messages({
        path: { id: sessionId },
        query: { limit: 100 },
      });

      return messagesResult.data || [];
    },
    enabled: !!server && !!sessionId,
  });

  const { data: models = [] } = useQuery({
    queryKey: ["server", server?.url, "providers"],
    queryFn: async () => {
      if (!server) {
        throw new Error("Server not found");
      }

      const client = createClient(server.url);
      const result = await client.provider.list();

      if (result.error) {
        throw result.error;
      }

      return result.data?.all || [];
    },
    select: (providers) => {
      const allModels: Array<{
        id: string;
        providerID: string;
        name: string;
      }> = [];

      providers.forEach((provider) => {
        Object.values(provider.models || {}).forEach((model) => {
          allModels.push({
            id: model.id,
            providerID: provider.id,
            name: model.name,
          });
        });
      });

      return allModels;
    },
    enabled: !!server,
  });

  // Get the model from the latest user message
  const latestUserMessage = [...messages]
    .reverse()
    .find((m) => m.info.role === "user");
  const currentModel =
    latestUserMessage?.info.role === "user"
      ? {
          modelID: latestUserMessage.info.model.modelID,
          providerID: latestUserMessage.info.model.providerID,
        }
      : {
          modelID: "big-pickle",
          providerID: "opencode",
        };

  const selectedModel = models.find(
    (m) =>
      m.id === currentModel.modelID && m.providerID === currentModel.providerID,
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Settings",
        }}
      />
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <ScrollView>
          <View className="p-4">
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row items-center justify-between">
              <Text className="text-base font-medium text-gray-900 dark:text-white">
                Model
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {selectedModel?.name || "big-pickle"}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
