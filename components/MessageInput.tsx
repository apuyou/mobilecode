import { router } from "expo-router";
import { ChevronDown, Send } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  useColorScheme,
  View,
} from "react-native";

import {
  FileMentionItem,
  FileMentionPopover,
} from "@/components/FileMentionPopover";
import { useFileSearch } from "@/hooks/useFileSearch";
import { ModelInfo } from "@/hooks/useModels";
import { Server } from "@/stores";

export interface MentionedFile {
  path: string;
}

interface MessageInputProps {
  onSend: (message: string, files: MentionedFile[]) => void;
  disabled?: boolean;
  selectedAgent: string;
  selectedModel: ModelInfo | undefined;
  server: Server;
  projectPath: string | undefined;
}

/** Unicode zero-width space used as invisible delimiters around mentions. */
const ZWS = "\u200B";

/**
 * Extract the @-mention query from text at the given cursor position.
 * Returns the query string after @ if currently in a mention, or null.
 */
function extractMentionQuery(text: string, cursorPos: number): string | null {
  const beforeCursor = text.slice(0, cursorPos);
  const match = beforeCursor.match(/@([^\s\u200B]*)$/);
  if (!match) {
    return null;
  }

  return match[1];
}

/**
 * Build the full mention token for a given path.
 */
function mentionToken(path: string): string {
  return `${ZWS}@${path}${ZWS}`;
}

interface TextSegment {
  text: string;
  isMention: boolean;
}

/**
 * Split message text into segments of plain text and mention tokens.
 * Mention tokens are displayed without ZWS delimiters.
 */
function segmentMessage(
  text: string,
  knownPaths: Set<string>,
): TextSegment[] {
  if (knownPaths.size === 0) {
    return [{ text, isMention: false }];
  }

  // Build a list of mention ranges
  const ranges: { start: number; end: number; display: string }[] = [];
  for (const path of knownPaths) {
    const token = mentionToken(path);
    let idx = text.indexOf(token);
    while (idx !== -1) {
      ranges.push({
        start: idx,
        end: idx + token.length,
        display: `@${path}`,
      });
      idx = text.indexOf(token, idx + token.length);
    }
  }

  if (ranges.length === 0) {
    return [{ text, isMention: false }];
  }

  // Sort by position
  ranges.sort((a, b) => a.start - b.start);

  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (cursor < range.start) {
      segments.push({ text: text.slice(cursor, range.start), isMention: false });
    }
    segments.push({ text: text.slice(range.start, range.end), isMention: true });
    cursor = range.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMention: false });
  }

  return segments;
}

/**
 * Given the previous and new text, repair any partially-edited mention tokens.
 * If a known mention token was damaged (partially deleted), remove it entirely.
 * Returns the cleaned text and the updated set of paths.
 */
function repairMentions(
  newText: string,
  knownPaths: Set<string>,
): { text: string; paths: Set<string> } {
  const survivingPaths = new Set<string>();
  let repairedText = newText;

  for (const path of knownPaths) {
    const token = mentionToken(path);
    if (repairedText.includes(token)) {
      survivingPaths.add(path);
    } else {
      // The token was damaged -- remove any remnants
      // Possible remnants: partial token where user deleted some chars
      // We look for any substring that looks like a broken version of the token
      const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const remnantPattern = new RegExp(
        `\u200B?@?${escaped}\u200B?`,
      );
      repairedText = repairedText.replace(remnantPattern, "");
    }
  }

  return { text: repairedText, paths: survivingPaths };
}

export function MessageInput({
  onSend,
  disabled,
  selectedAgent,
  selectedModel,
  server,
  projectPath,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mentionedPaths, setMentionedPaths] = useState<Set<string>>(
    new Set(),
  );
  const [showPopover, setShowPopover] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const cursorPosRef = useRef(0);
  const inputRef = useRef<TextInput>(null);

  const { data: searchResults = [], isLoading: isSearching } = useFileSearch(
    server,
    projectPath,
    mentionQuery,
  );

  const fileItems: FileMentionItem[] = useMemo(() => {
    return searchResults.map((path) => ({
      path,
      isDirectory: path.endsWith("/"),
    }));
  }, [searchResults]);

  const handleTextChange = useCallback(
    (text: string) => {
      // Repair any partially-edited mentions
      const { text: repairedText, paths: survivingPaths } = repairMentions(
        text,
        mentionedPaths,
      );

      setMessage(repairedText);
      setMentionedPaths(survivingPaths);

      // Estimate cursor: if text grew, cursor moved forward by the delta.
      // If text shrank (repair or backspace), clamp to new length.
      const prevLen = message.length;
      const delta = text.length - prevLen;
      const repairDelta = repairedText.length - text.length;
      const estimatedCursor = Math.max(
        0,
        Math.min(cursorPosRef.current + delta + repairDelta, repairedText.length),
      );
      cursorPosRef.current = estimatedCursor;

      const query = extractMentionQuery(repairedText, estimatedCursor);
      if (query !== null) {
        setMentionQuery(query);
        setShowPopover(true);
        setActiveIndex(0);
      } else {
        setShowPopover(false);
        setMentionQuery("");
      }
    },
    [mentionedPaths, message.length],
  );

  const handleSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      cursorPosRef.current = e.nativeEvent.selection.end;

      const query = extractMentionQuery(message, e.nativeEvent.selection.end);
      if (query !== null) {
        setMentionQuery(query);
        setShowPopover(true);
      } else {
        setShowPopover(false);
        setMentionQuery("");
      }
    },
    [message],
  );

  const handleFileSelect = useCallback(
    (item: FileMentionItem) => {
      const beforeCursor = message.slice(0, cursorPosRef.current);
      const match = beforeCursor.match(/@([^\s\u200B]*)$/);
      if (!match) {
        return;
      }

      const atStart = cursorPosRef.current - match[0].length;
      const afterCursor = message.slice(cursorPosRef.current);

      // Insert: ZWS@pathZWS followed by a space for continued typing
      const token = mentionToken(item.path) + " ";
      const newMessage = message.slice(0, atStart) + token + afterCursor;
      const newCursorPos = atStart + token.length;

      setMessage(newMessage);
      cursorPosRef.current = newCursorPos;

      setMentionedPaths((prev) => {
        const next = new Set(prev);
        next.add(item.path);

        return next;
      });

      setShowPopover(false);
      setMentionQuery("");

      // Restore focus after state update
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
    [message],
  );

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed || disabled) {
      return;
    }

    // Build the file list from paths still present in the text
    const files: MentionedFile[] = [];
    for (const path of mentionedPaths) {
      if (message.includes(mentionToken(path))) {
        files.push({ path });
      }
    }

    // Strip ZWS characters from the sent text
    const cleanMessage = trimmed.replace(/\u200B/g, "");

    onSend(cleanMessage, files);
    setMessage("");
    setMentionedPaths(new Set());
  };

  const hasContent = message.trim().length > 0;
  const colorScheme = useColorScheme();
  const mentionColor = colorScheme === "dark" ? "#93c5fd" : "#2563eb";
  const textColor = colorScheme === "dark" ? "#f3f4f6" : "#111827";
  const segments = useMemo(
    () => segmentMessage(message, mentionedPaths),
    [message, mentionedPaths],
  );

  return (
    <View className="px-4 pt-2 pb-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {showPopover && (
        <View className="mb-2">
          <FileMentionPopover
            items={fileItems}
            activeIndex={activeIndex}
            onSelect={handleFileSelect}
            isLoading={isSearching}
            query={mentionQuery}
          />
        </View>
      )}

      <View className="bg-gray-100 dark:bg-gray-900 rounded-2xl">
        <View className="flex-row items-end px-4 py-2">
          <TextInput
            ref={inputRef}
            onChangeText={handleTextChange}
            onSelectionChange={handleSelectionChange}
            placeholder="Ask anything... (type @ for files)"
            className="flex-1 self-start text-base p-0 m-0"
            style={{ maxHeight: 120 }}
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={10000}
            submitBehavior="newline"
          >
            <Text>
              {segments.map((seg, i) => (
                <Text
                  key={i}
                  style={{ color: seg.isMention ? mentionColor : textColor }}
                >
                  {seg.text}
                </Text>
              ))}
            </Text>
          </TextInput>
          <Pressable
            onPress={handleSend}
            disabled={!hasContent || disabled}
            className={`w-8 h-8 rounded-full items-center justify-center ml-2 mb-0.5 ${
              hasContent && !disabled
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
          >
            <Send
              size={16}
              color={hasContent && !disabled ? "white" : "#9ca3af"}
            />
          </Pressable>
        </View>

        <View className="flex-row items-center px-3 pb-2 pt-0.5 gap-1">
          <Pressable
            onPress={() => router.push("/picker/agent")}
            className="flex-row items-center px-2 py-1 rounded-lg active:bg-gray-200 dark:active:bg-gray-800"
          >
            <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
              {selectedAgent}
            </Text>
            <ChevronDown size={14} color="#9ca3af" className="ml-0.5" />
          </Pressable>

          <Pressable
            onPress={() => router.push("/picker/model")}
            className="flex-row items-center px-2 py-1 rounded-lg active:bg-gray-200 dark:active:bg-gray-800 shrink min-w-0 gap-1.5"
          >
            {selectedModel && (
              <View className="w-4 h-4 rounded bg-gray-600 dark:bg-gray-400 items-center justify-center">
                <Text className="text-[10px] font-bold text-white dark:text-gray-900 leading-tight">
                  {selectedModel.providerID.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text
              className="text-sm text-gray-600 dark:text-gray-400 shrink min-w-0"
              numberOfLines={1}
            >
              {selectedModel?.name || "Select model"}
            </Text>
            <ChevronDown
              size={14}
              color="#9ca3af"
              className="ml-0.5 shrink-0"
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
