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
import { MentionedFile, MessageInput } from "@/components/MessageInput";
import { PermissionBanner } from "@/components/PermissionBanner";
import { QuestionBanner } from "@/components/QuestionBanner";
import { useAgents } from "@/hooks/useAgents";
import { useModels } from "@/hooks/useModels";
import { usePermissions } from "@/hooks/usePermissions";
import { useProjects } from "@/hooks/useProjects";
import { useQuestions } from "@/hooks/useQuestions";
import { useSessionMessages } from "@/hooks/useSessionMessages";
import { Identifier } from "@/lib/id";
import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";
import { usePickerStore } from "@/stores/picker";

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

  const selectedAgent = usePickerStore((s) => s.selectedAgent);
  const selectedModel = usePickerStore((s) => s.selectedModel);
  const setAgents = usePickerStore((s) => s.setAgents);
  const setModels = usePickerStore((s) => s.setModels);
  const setSelectedAgent = usePickerStore((s) => s.setSelectedAgent);
  const setSelectedModel = usePickerStore((s) => s.setSelectedModel);

  const { data: projects = [] } = useProjects(server.url);

  const projectPath = projects.find((p) => p.id === projectId)?.worktree;

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
        sessionID: sessionId,
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

  const { data: agents = [] } = useAgents(server);
  const { data: models = [] } = useModels(server);
  const { data: pendingQuestions = [] } = useQuestions(server, sessionId);
  const { data: pendingPermissions = [] } = usePermissions(server, sessionId);

  // Sync agents and models to the picker store
  useEffect(() => {
    setAgents(agents);
  }, [agents, setAgents]);

  useEffect(() => {
    setModels(models);
  }, [models, setModels]);

  const sortedMessages = [...messages]
    .sort((a, b) => a.info.id.localeCompare(b.info.id))
    .reverse();

  const latestUserMessage = sortedMessages.find((m) => m.info.role === "user");
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

  // Initialize selected agent from the session's last message
  const initialAgentSet = useRef(false);
  useEffect(() => {
    if (initialAgentSet.current || agents.length === 0 || !latestUserMessage) {
      return;
    }

    const agentFromMessage =
      latestUserMessage.info.role === "user"
        ? latestUserMessage.info.agent
        : undefined;

    if (agentFromMessage && agents.some((a) => a.name === agentFromMessage)) {
      setSelectedAgent(agentFromMessage);
      initialAgentSet.current = true;
    }
  }, [agents, latestUserMessage, setSelectedAgent]);

  // Initialize selected model from the session's last message
  const initialModelSet = useRef(false);
  useEffect(() => {
    if (initialModelSet.current || models.length === 0) {
      return;
    }

    const matchFromMessage = models.find(
      (m) =>
        m.id === currentModel.modelID &&
        m.providerID === currentModel.providerID,
    );

    if (matchFromMessage) {
      setSelectedModel(matchFromMessage);
      initialModelSet.current = true;
    } else if (models.length > 0) {
      setSelectedModel(models[0]);
      initialModelSet.current = true;
    }
  }, [models, currentModel.modelID, currentModel.providerID, setSelectedModel]);

  const modelForSend = selectedModel
    ? { modelID: selectedModel.id, providerID: selectedModel.providerID }
    : currentModel;

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      text,
      files,
    }: {
      text: string;
      files: MentionedFile[];
    }) => {
      const client = createClient(server.url, projectPath);

      const messageID = Identifier.ascending("message");
      const parts: (
        | { id: string; type: "text"; text: string }
        | {
            id: string;
            type: "file";
            mime: string;
            url: string;
            filename: string;
            source: {
              type: "file";
              path: string;
              text: { value: string; start: number; end: number };
            };
          }
      )[] = [
        {
          id: Identifier.ascending("part"),
          type: "text",
          text,
        },
      ];

      for (const file of files) {
        const filePath = file.path.startsWith("/")
          ? file.path
          : `${(projectPath || "").replace(/[\\/]+$/, "")}/${file.path}`;
        const filename = file.path.split("/").pop() || file.path;

        parts.push({
          id: Identifier.ascending("part"),
          type: "file",
          mime: "text/plain",
          url: `file://${filePath}`,
          filename,
          source: {
            type: "file",
            path: filePath,
            text: {
              value: `@${file.path}`,
              start: 0,
              end: file.path.length + 1,
            },
          },
        });
      }

      const result = await client.session.promptAsync({
        sessionID: sessionId,
        messageID,
        agent: selectedAgent,
        model: modelForSend,
        parts,
      });

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", sessionId, "messages"],
      });
    },
  });

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
              className="p-2"
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
              data={sortedMessages}
              keyExtractor={(item) => item.info.id}
              inverted={true}
              renderItem={({ item }) => <ChatMessage message={item} />}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
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
            />

            {pendingPermissions.map((permission) => (
              <PermissionBanner
                key={permission.id}
                request={permission}
                server={server}
              />
            ))}

            {pendingQuestions.map((question) => (
              <QuestionBanner
                key={question.id}
                request={question}
                server={server}
              />
            ))}

            <MessageInput
              onSend={(text, files) =>
                sendMessageMutation.mutate({ text, files })
              }
              disabled={sendMessageMutation.isPending}
              selectedAgent={selectedAgent}
              selectedModel={selectedModel}
              serverUrl={server.url}
              projectPath={projectPath}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
