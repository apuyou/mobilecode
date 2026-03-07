import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useProjects } from "@/hooks/useProjects";
import { useSessionMessages } from "@/hooks/useSessionMessages";
import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

interface SessionSettingsContentProps {
  server: Server;
  projectId: string;
  sessionId: string;
}

export function SessionSettingsContent({
  server,
  projectId,
  sessionId,
}: SessionSettingsContentProps) {
  const queryClient = useQueryClient();
  const { data: messages = [] } = useSessionMessages(server, sessionId);
  const { data: projects = [] } = useProjects(server);

  const projectPath = projects.find((p) => p.id === projectId)?.worktree;

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        directory: projectPath,
        username: server.username,
        password: server.password,
      });
      await client.session.update({
        sessionID: sessionId,
        time: { archived: Date.now() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url],
      });
      router.dismiss(2);
    },
  });

  const { data: models = [] } = useQuery({
    queryKey: ["server", server.url, "providers"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
      const result = await client.provider.list();

      return result.data?.all || [];
    },
    select: (providers) => {
      const allModels: {
        id: string;
        providerID: string;
        name: string;
      }[] = [];

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
  });

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

            <Pressable
              onPress={() => {
                Alert.alert(
                  "Archive Session",
                  "Are you sure you want to archive this session?",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Archive",
                      style: "destructive",
                      onPress: () => archiveMutation.mutate(),
                    },
                  ],
                );
              }}
              disabled={archiveMutation.isPending}
              className="mt-4 bg-red-500 rounded-xl p-4 items-center opacity-100 disabled:opacity-50"
            >
              <Text className="text-base font-medium text-white">
                {archiveMutation.isPending
                  ? "Archiving..."
                  : "Archive Session"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
