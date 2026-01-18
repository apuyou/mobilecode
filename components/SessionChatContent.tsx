import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { Settings } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatMessage } from "@/components/ChatMessage";
import { MessageInput } from "@/components/MessageInput";
import { useSessionMessages } from "@/hooks/useSessionMessages";
import { Identifier } from "@/lib/id";
import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

interface SessionChatContentProps {
  server: Server;
  sessionId: string;
  projectId: string;
}

export function SessionChatContent({
  server,
  sessionId,
  projectId,
}: SessionChatContentProps) {
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const hasScrolledToEndRef = useRef(false);

  const { data: projectsData } = useQuery({
    queryKey: ["server", server.url, "projects"],
    queryFn: async () => {
      const client = createClient(server.url);
      const result = await client.project.list();

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
  });

  const project = projectsData?.find((p) => p.id === projectId);
  const projectPath = project?.worktree;

  const { data: session } = useQuery({
    queryKey: [
      "server",
      server.url,
      "project",
      projectPath,
      "sessions",
      sessionId,
    ],
    queryFn: async () => {
      const client = createClient(server.url, projectPath);
      const result = await client.session.get({
        path: { id: sessionId },
      });

      return result.data;
    },
    enabled: !!projectPath,
  });

  const sessionTitle =
    session?.title || `Session ${sessionId?.slice(0, 8) || "Chat"}`;

  const {
    data: messages = [],
    isLoading,
    error,
  } = useSessionMessages(server.url, sessionId);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (text: string) => {
      const client = createClient(server.url, projectPath);

      const messageID = Identifier.ascending("message");
      const partID = Identifier.ascending("part");
      const result = await client.session.prompt({
        path: { id: sessionId },
        body: {
          messageID,
          agent: "build",
          model: currentModel,
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
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", sessionId, "messages"],
      });
    },
  });

  useEffect(() => {
    if (messages.length > 0 && hasScrolledToEndRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <>
      <Stack.Screen
        options={{
          title: sessionTitle,
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push(
                  `/server/${server.id}/project/${projectId}/session/${sessionId}/settings`,
                )
              }
              className="mr-2"
            >
              <Settings size={24} color="#3b82f6" />
            </Pressable>
          ),
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
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.info.id}
              renderItem={({ item }) => <ChatMessage message={item} />}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              initialScrollIndex={
                messages.length > 0 ? messages.length - 1 : undefined
              }
              onScrollToIndexFailed={() => {
                setTimeout(() => {
                  if (messages.length > 0) {
                    flatListRef.current?.scrollToEnd({ animated: false });
                  }
                }, 100);
              }}
              onLayout={() => {
                if (!hasScrolledToEndRef.current && messages.length > 0) {
                  hasScrolledToEndRef.current = true;
                }
              }}
              ListEmptyComponent={
                isLoading ? (
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
                ) : (
                  <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-gray-500 dark:text-gray-400 text-center">
                      No messages yet. Start the conversation!
                    </Text>
                  </View>
                )
              }
              onContentSizeChange={() => {
                if (hasScrolledToEndRef.current) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
            />

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
