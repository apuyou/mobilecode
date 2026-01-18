import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatMessage } from "@/components/ChatMessage";
import { MessageInput } from "@/components/MessageInput";
import { Identifier } from "@/lib/id";
import { createClient } from "@/lib/opencode-client";
import { Message } from "@/lib/types";
import { useAppStore } from "@/stores";

export default function SessionChatScreen() {
  const { serverId, sessionId, projectId } = useLocalSearchParams<{
    serverId: string;
    sessionId: string;
    projectId?: string;
  }>();
  const queryClient = useQueryClient();
  const servers = useAppStore((s) => s.servers);
  const server = servers.find((s) => s.id === serverId);
  const flatListRef = useRef<FlatList>(null);

  const { data: projectsData } = useQuery({
    queryKey: ["server", server?.url, "projects"],
    queryFn: async () => {
      if (!server) {
        throw new Error("Server not found");
      }

      const client = createClient(server.url);
      const result = await client.project.list();

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!server && !!projectId,
  });

  const project = projectsData?.find((p: any) => p.id === projectId);
  const projectPath = project?.worktree;

  const { data: sessionData } = useQuery({
    queryKey: ["server", server?.url, "project", projectPath, "sessions"],
    queryFn: async () => {
      if (!server) {
        throw new Error("Server not found");
      }

      const client = createClient(server.url, projectPath);
      const result = await client.session.list({
        query: { directory: projectPath },
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    enabled: !!server && !!projectPath,
  });

  const session = sessionData?.find((s: any) => s.id === sessionId);
  const sessionTitle =
    session?.title || `Session ${sessionId?.slice(0, 8) || "Chat"}`;

  const {
    data: messages = [],
    isLoading,
    error,
  } = useQuery({
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
    select: (data) => {
      return data.map((msg) => {
        const parts = msg.parts
          .map((part) => {
            if (part.type === "text") {
              return {
                type: "text",
                content: part.text,
              };
            }

            if (part.type === "tool") {
              return {
                type: "tool-invocation",
                toolName: part.tool || "Unknown Tool",
                input: part.state?.input || {},
                status: part.state?.status || "unknown",
              };
            }

            return null;
          })
          .filter(Boolean);

        return {
          id: msg.info.id,
          role: msg.info.role,
          parts,
          createdAt: new Date(msg.info.time.created).toISOString(),
        };
      });
    },
    enabled: !!server && !!sessionId,
    refetchInterval: 3000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!server || !sessionId || !session) {
        throw new Error("Server or session not found");
      }

      const client = createClient(server.url, projectPath);

      const messageID = Identifier.ascending("message");
      const partID = Identifier.ascending("part");
      const result = await client.session.prompt({
        path: { id: sessionId },
        body: {
          messageID,
          agent: "build",
          model: {
            modelID: "big-pickle",
            providerID: "opencode",
          },
          parts: [
            {
              id: partID,
              type: "text",
              text,
            },
          ],
        },
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate immediately to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ["server", server?.url, "session", sessionId, "messages"],
      });
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (!server) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <Text className="text-gray-500 dark:text-gray-400">
          Server not found
        </Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: sessionTitle,
        }}
      />
      <SafeAreaView
        className="flex-1 bg-white dark:bg-gray-800"
        edges={["bottom"]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={100}
        >
          <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-gray-500 dark:text-gray-400 mt-3">
                  Loading messages...
                </Text>
              </View>
            ) : error ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-red-600 dark:text-red-400 text-center">
                  {(error as Error).message}
                </Text>
              </View>
            ) : messages.length === 0 ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  No messages yet. Start the conversation!
                </Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatMessage message={item} />}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() =>
                  flatListRef.current?.scrollToEnd({ animated: true })
                }
              />
            )}

            <MessageInput
              onSend={(text) => sendMessageMutation.mutate(text)}
              disabled={sendMessageMutation.isPending}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
