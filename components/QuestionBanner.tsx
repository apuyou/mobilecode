import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircleQuestion, X } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { QuestionRequest } from "@opencode-ai/sdk/v2";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

interface QuestionBannerProps {
  request: QuestionRequest;
  server: Server;
}

export function QuestionBanner({ request, server }: QuestionBannerProps) {
  const queryClient = useQueryClient();
  // Per-question selections: array of selected labels for each question
  const [selections, setSelections] = useState<string[][]>(
    () => request.questions.map(() => []),
  );
  // Per-question custom text inputs
  const [customInputs, setCustomInputs] = useState<string[]>(
    () => request.questions.map(() => ""),
  );

  const replyMutation = useMutation({
    mutationFn: async (answers: string[][]) => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });

      return client.question.reply({
        requestID: request.id,
        answers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "messages"],
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });

      return client.question.reject({
        requestID: request.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "questions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["server", server.url, "session", request.sessionID, "messages"],
      });
    },
  });

  const isPending = replyMutation.isPending || rejectMutation.isPending;

  function toggleOption(questionIndex: number, label: string) {
    setSelections((prev) => {
      const updated = [...prev];
      const current = updated[questionIndex] ?? [];
      const question = request.questions[questionIndex];
      const isMultiple = question?.multiple ?? false;

      if (current.includes(label)) {
        updated[questionIndex] = current.filter((l) => l !== label);
      } else if (isMultiple) {
        updated[questionIndex] = [...current, label];
      } else {
        updated[questionIndex] = [label];
      }

      return updated;
    });
  }

  function updateCustomInput(questionIndex: number, text: string) {
    setCustomInputs((prev) => {
      const updated = [...prev];
      updated[questionIndex] = text;

      return updated;
    });
  }

  function handleSubmit() {
    const answers = request.questions.map((q, i) => {
      const selected = selections[i] ?? [];
      const customText = (customInputs[i] ?? "").trim();
      const allowsCustom = q.custom !== false;

      if (customText && allowsCustom) {
        return [...selected, customText];
      }

      return selected;
    });

    replyMutation.mutate(answers);
  }

  const canSubmit = selections.some((s) => s.length > 0) ||
    customInputs.some((t) => t.trim().length > 0);

  return (
    <View className="mx-4 mb-3 bg-blue-50 dark:bg-blue-950 rounded-xl border border-blue-200 dark:border-blue-800 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <View className="flex-row items-center gap-2">
          <MessageCircleQuestion size={18} color="#3b82f6" />
          <Text className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Question
          </Text>
        </View>
        <Pressable
          onPress={() => rejectMutation.mutate()}
          disabled={isPending}
          className="p-1"
        >
          <X size={18} color="#6b7280" />
        </Pressable>
      </View>

      {/* Questions */}
      {request.questions.map((question, qi) => (
        <View key={qi} className="px-4 pb-3">
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {question.question}
          </Text>

          {/* Options */}
          <View className="gap-1.5">
            {question.options.map((option) => {
              const isSelected = (selections[qi] ?? []).includes(option.label);

              return (
                <Pressable
                  key={option.label}
                  onPress={() => toggleOption(qi, option.label)}
                  disabled={isPending}
                  className={`px-3 py-2.5 rounded-lg border ${
                    isSelected
                      ? "bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-600"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {/* Custom input */}
          {question.custom !== false ? (
            <TextInput
              value={customInputs[qi]}
              onChangeText={(text) => updateCustomInput(qi, text)}
              placeholder="Type your own answer..."
              placeholderTextColor="#9ca3af"
              editable={!isPending}
              className="mt-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100"
            />
          ) : null}
        </View>
      ))}

      {/* Actions */}
      <View className="flex-row justify-end gap-2 px-4 pb-3">
        <Pressable
          onPress={() => rejectMutation.mutate()}
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dismiss
          </Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          disabled={isPending || !canSubmit}
          className={`px-4 py-2 rounded-lg flex-row items-center gap-2 ${
            canSubmit && !isPending
              ? "bg-blue-600"
              : "bg-blue-400 dark:bg-blue-800"
          }`}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : null}
          <Text className="text-sm font-medium text-white">
            Submit
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
