import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Terminal } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { PermissionRequest } from "@opencode-ai/sdk/v2";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

interface PermissionBannerProps {
  request: PermissionRequest;
  server: Server;
}

function getPermissionLabel(permission: string): string {
  switch (permission) {
    case "bash":
      return "Run command";
    case "edit":
      return "Edit file";
    case "read":
      return "Read file";
    case "external_directory":
      return "Access external directory";
    case "doom_loop":
      return "Repeated tool call";
    default:
      return permission;
  }
}

function getPermissionIcon(permission: string) {
  if (permission === "bash") {
    return <Terminal size={18} color="#f59e0b" />;
  }

  return <Shield size={18} color="#f59e0b" />;
}

export function PermissionBanner({ request, server }: PermissionBannerProps) {
  const queryClient = useQueryClient();
  const [rejectMessage, setRejectMessage] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const replyMutation = useMutation({
    mutationFn: async ({ reply, message }: { reply: "once" | "always" | "reject"; message?: string }) => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });

      return client.permission.reply({
        requestID: request.id,
        reply,
        message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "permissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "messages"],
      });
    },
  });

  const isPending = replyMutation.isPending;

  function handleAllow() {
    replyMutation.mutate({ reply: "once" });
  }

  function handleAlwaysAllow() {
    replyMutation.mutate({ reply: "always" });
  }

  function handleReject() {
    if (showRejectInput) {
      const message = rejectMessage.trim() || undefined;
      replyMutation.mutate({ reply: "reject", message });
    } else {
      setShowRejectInput(true);
    }
  }

  function handleRejectImmediately() {
    replyMutation.mutate({ reply: "reject" });
  }

  const patterns = request.patterns ?? [];
  const metadata = request.metadata ?? {};
  const command = metadata.command as string | undefined;

  return (
    <View className="mx-4 mb-3 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center gap-2 px-4 pt-3 pb-2">
        {getPermissionIcon(request.permission)}
        <Text className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex-1">
          {getPermissionLabel(request.permission)}
        </Text>
      </View>

      {/* Details */}
      <View className="px-4 pb-3">
        {command ? (
          <View className="bg-gray-900 dark:bg-gray-950 rounded-lg px-3 py-2 mb-2">
            <Text className="text-xs font-mono text-green-400" numberOfLines={5}>
              $ {command}
            </Text>
          </View>
        ) : null}

        {!command && patterns.length > 0 ? (
          <View className="gap-1 mb-2">
            {patterns.map((pattern, i) => (
              <Text
                key={i}
                className="text-xs font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded px-2 py-1"
                numberOfLines={2}
              >
                {pattern}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Reject with message input */}
        {showRejectInput ? (
          <TextInput
            value={rejectMessage}
            onChangeText={setRejectMessage}
            placeholder="Feedback for the agent (optional)..."
            placeholderTextColor="#9ca3af"
            editable={!isPending}
            autoFocus
            className="mb-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100"
          />
        ) : null}
      </View>

      {/* Actions */}
      <View className="flex-row justify-end gap-2 px-4 pb-3">
        {isPending ? (
          <ActivityIndicator size="small" color="#f59e0b" />
        ) : (
          <>
            <Pressable
              onPress={showRejectInput ? handleReject : handleRejectImmediately}
              disabled={isPending}
              className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30"
            >
              <Text className="text-sm font-medium text-red-700 dark:text-red-400">
                {showRejectInput ? "Send" : "Reject"}
              </Text>
            </Pressable>
            {!showRejectInput ? (
              <Pressable
                onPress={() => setShowRejectInput(true)}
                disabled={isPending}
                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
              >
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reject with feedback
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleAlwaysAllow}
              disabled={isPending}
              className="px-3 py-2 rounded-lg bg-amber-200 dark:bg-amber-800"
            >
              <Text className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Always
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAllow}
              disabled={isPending}
              className="px-3 py-2 rounded-lg bg-green-600"
            >
              <Text className="text-sm font-medium text-white">
                Allow
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
