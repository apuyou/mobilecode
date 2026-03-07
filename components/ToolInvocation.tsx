import {
  ChevronDown,
  ChevronUp,
  Eye,
  FileCode,
  FileText,
  HelpCircle,
  ListTree,
  MessageCircleQuestion,
  Search,
  Terminal,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { ToolPart } from "@opencode-ai/sdk/v2";

import { StatusBadge } from "./StatusBadge";

type ToolStatus = "pending" | "running" | "completed" | "error";

interface ToolInvocationProps {
  part: ToolPart;
}

function getToolStatus(part: ToolPart): ToolStatus {
  return part.state.status as ToolStatus;
}

function getInput(part: ToolPart): Record<string, unknown> {
  return (part.state.input ?? {}) as Record<string, unknown>;
}

function getOutput(part: ToolPart): string | undefined {
  if (part.state.status === "completed") {
    return part.state.output;
  }

  return undefined;
}

function getMetadata(part: ToolPart): Record<string, unknown> {
  if (part.state.status === "running" || part.state.status === "completed") {
    return (part.state.metadata ?? {}) as Record<string, unknown>;
  }

  return {};
}

function getError(part: ToolPart): string | undefined {
  if (part.state.status === "error") {
    return part.state.error;
  }

  return undefined;
}

function getFilename(path: string | undefined): string {
  if (!path) {
    return "";
  }

  const parts = path.split("/");

  return parts[parts.length - 1] || path;
}

function getDirectory(path: string | undefined): string {
  if (!path) {
    return "";
  }

  const lastSlash = path.lastIndexOf("/");
  if (lastSlash <= 0) {
    return "";
  }

  return path.substring(0, lastSlash);
}

// -- Collapsible wrapper shared by all tool renderers --

function ToolCard({
  icon,
  title,
  subtitle,
  args,
  status,
  error,
  hideDetails,
  defaultExpanded = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  args?: string[];
  status: ToolStatus;
  error?: string;
  hideDetails?: boolean;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const pending = status === "pending" || status === "running";
  const hasDetails = !hideDetails && children;

  return (
    <View className="mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Pressable
        onPress={() => {
          if (hasDetails && !pending) {
            setExpanded(!expanded);
          }
        }}
        className="p-3 flex-row items-center justify-between gap-2"
      >
        <View className="flex-row items-center gap-2 flex-1 min-w-0">
          {icon}
          <Text
            className={`text-sm font-semibold ${pending ? "text-yellow-600 dark:text-yellow-400" : "text-gray-900 dark:text-gray-100"}`}
            numberOfLines={1}
          >
            {title}
          </Text>
          {!pending && subtitle ? (
            <Text
              className="text-sm text-gray-500 dark:text-gray-400 flex-shrink"
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
          {!pending && args
            ? args.map((arg, i) => (
                <Text
                  key={i}
                  className="text-xs text-gray-400 dark:text-gray-500 font-mono"
                  numberOfLines={1}
                >
                  {arg}
                </Text>
              ))
            : null}
          {pending ? (
            <StatusBadge status="busy" size="sm" />
          ) : status === "error" ? (
            <StatusBadge status="error" size="sm" />
          ) : null}
        </View>
        {hasDetails && !pending ? (
          expanded ? (
            <ChevronUp size={14} color="#6b7280" />
          ) : (
            <ChevronDown size={14} color="#6b7280" />
          )
        ) : null}
      </Pressable>

      {error ? (
        <View className="px-3 pb-3 border-t border-red-200 dark:border-red-800">
          <Text className="text-xs text-red-600 dark:text-red-400 mt-2">
            {error}
          </Text>
        </View>
      ) : null}

      {expanded && hasDetails ? (
        <View className="border-t border-gray-200 dark:border-gray-700">
          {children}
        </View>
      ) : null}
    </View>
  );
}

// -- Specialized tool renderers --

function ReadToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const filePath = input.filePath as string | undefined;
  const offset = input.offset as number | undefined;
  const limit = input.limit as number | undefined;

  const args: string[] = [];
  if (offset !== undefined) {
    args.push(`offset=${offset}`);
  }
  if (limit !== undefined) {
    args.push(`limit=${limit}`);
  }

  return (
    <ToolCard
      icon={<Eye size={14} color="#6b7280" />}
      title="Read"
      subtitle={getFilename(filePath)}
      args={args}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function WriteToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const filePath = input.filePath as string | undefined;
  const directory = getDirectory(filePath);

  return (
    <ToolCard
      icon={<FileText size={14} color="#6b7280" />}
      title="Write"
      subtitle={getFilename(filePath)}
      status={status}
      error={error}
      hideDetails
    >
      {directory ? (
        <View className="px-3 py-1">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {directory}
          </Text>
        </View>
      ) : null}
    </ToolCard>
  );
}

function EditToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const filePath = input.filePath as string | undefined;
  const directory = getDirectory(filePath);

  return (
    <ToolCard
      icon={<FileCode size={14} color="#6b7280" />}
      title="Edit"
      subtitle={getFilename(filePath)}
      status={status}
      error={error}
      hideDetails
    >
      {directory ? (
        <View className="px-3 py-1">
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {directory}
          </Text>
        </View>
      ) : null}
    </ToolCard>
  );
}

function BashToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const output = getOutput(part);
  const command = input.command as string | undefined;
  const description = input.description as string | undefined;

  const shellOutput = (() => {
    if (!command && !output) {
      return undefined;
    }

    const cmd = command ?? "";
    const out = output ?? "";

    return `$ ${cmd}${out ? "\n\n" + out : ""}`;
  })();

  return (
    <ToolCard
      icon={<Terminal size={14} color="#6b7280" />}
      title="Shell"
      subtitle={description}
      status={status}
      error={error}
    >
      {shellOutput ? (
        <ScrollView
          horizontal={false}
          className="max-h-48"
          contentContainerClassName="p-3"
        >
          <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">
            {shellOutput}
          </Text>
        </ScrollView>
      ) : null}
    </ToolCard>
  );
}

function GlobToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const pattern = input.pattern as string | undefined;
  const path = input.path as string | undefined;

  const args: string[] = [];
  if (pattern) {
    args.push(`pattern=${pattern}`);
  }

  return (
    <ToolCard
      icon={<Search size={14} color="#6b7280" />}
      title="Glob"
      subtitle={path || "/"}
      args={args}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function GrepToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const pattern = input.pattern as string | undefined;
  const include = input.include as string | undefined;
  const path = input.path as string | undefined;

  const args: string[] = [];
  if (pattern) {
    args.push(`pattern=${pattern}`);
  }
  if (include) {
    args.push(`include=${include}`);
  }

  return (
    <ToolCard
      icon={<Search size={14} color="#6b7280" />}
      title="Grep"
      subtitle={path || "/"}
      args={args}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function TaskToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const subagentType = input.subagent_type as string | undefined;
  const description = input.description as string | undefined;

  return (
    <ToolCard
      icon={<ListTree size={14} color="#6b7280" />}
      title={`Agent ${subagentType || "task"}`}
      subtitle={description}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function QuestionToolDisplay({ part }: { part: ToolPart }) {
  const status = getToolStatus(part);
  const error = getError(part);
  const input = getInput(part);
  const metadata = getMetadata(part);

  const questions = (input.questions ?? []) as {
    question: string;
    header?: string;
    options?: { label: string; description?: string }[];
  }[];
  const answers = (metadata.answers ?? []) as string[][];
  const completed = answers.length > 0;

  const subtitle = (() => {
    const count = questions.length;
    if (count === 0) {
      return "";
    }
    if (completed) {
      return `${count} answered`;
    }

    return `${count} question${count > 1 ? "s" : ""}`;
  })();

  return (
    <ToolCard
      icon={<MessageCircleQuestion size={14} color="#6b7280" />}
      title="Questions"
      subtitle={subtitle}
      status={status}
      error={error}
      defaultExpanded={completed}
    >
      {completed ? (
        <View className="px-3 py-2 gap-2">
          {questions.map((q, i) => {
            const answer = answers[i] ?? [];

            return (
              <View key={i} className="gap-1">
                <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {q.question}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {answer.join(", ") || "No answer"}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </ToolCard>
  );
}

function WebFetchToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const url = input.url as string | undefined;

  return (
    <ToolCard
      icon={<Search size={14} color="#6b7280" />}
      title="Web fetch"
      subtitle={url}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function SkillToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const status = getToolStatus(part);
  const error = getError(part);
  const name = input.name as string | undefined;

  return (
    <ToolCard
      icon={<HelpCircle size={14} color="#6b7280" />}
      title={name || "Skill"}
      status={status}
      error={error}
      hideDetails
    />
  );
}

function TodoWriteToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const metadata = getMetadata(part);
  const status = getToolStatus(part);
  const error = getError(part);

  const todos = (() => {
    const meta = metadata.todos;
    if (Array.isArray(meta)) {
      return meta as {
        content: string;
        status: string;
        priority?: string;
      }[];
    }

    const inputTodos = input.todos;
    if (Array.isArray(inputTodos)) {
      return inputTodos as {
        content: string;
        status: string;
        priority?: string;
      }[];
    }

    return [];
  })();

  const completedCount = todos.filter((t) => t.status === "completed").length;
  const subtitle =
    todos.length > 0 ? `${completedCount}/${todos.length}` : undefined;

  return (
    <ToolCard
      icon={<ListTree size={14} color="#6b7280" />}
      title="Todos"
      subtitle={subtitle}
      status={status}
      error={error}
      defaultExpanded={true}
    >
      {todos.length > 0 ? (
        <View className="px-3 py-2 gap-1">
          {todos.map((todo, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-700 dark:text-gray-300">
                {todo.status === "completed"
                  ? "\u2611"
                  : todo.status === "in_progress"
                    ? "\u25B6"
                    : "\u2610"}
              </Text>
              <Text
                className={`text-xs flex-1 ${todo.status === "completed" ? "text-gray-400 dark:text-gray-500 line-through" : "text-gray-700 dark:text-gray-300"}`}
                numberOfLines={2}
              >
                {todo.content}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </ToolCard>
  );
}

// -- Default fallback for unknown tools --

function DefaultToolDisplay({ part }: { part: ToolPart }) {
  const input = getInput(part);
  const output = getOutput(part);
  const status = getToolStatus(part);
  const error = getError(part);

  return (
    <ToolCard
      icon={<FileText size={14} color="#6b7280" />}
      title={part.tool || "Unknown Tool"}
      status={status}
      error={error}
    >
      <View className="px-3 pb-3">
        {Object.keys(input).length > 0 ? (
          <View className="mt-2">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Input:
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded p-2">
              <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">
                {JSON.stringify(input, null, 2)}
              </Text>
            </View>
          </View>
        ) : null}

        {output !== undefined ? (
          <View className="mt-2">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Output:
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded p-2">
              <ScrollView horizontal={false} className="max-h-48">
                <Text className="text-xs font-mono text-gray-900 dark:text-gray-100">
                  {output}
                </Text>
              </ScrollView>
            </View>
          </View>
        ) : null}
      </View>
    </ToolCard>
  );
}

// -- Tool renderers registry --

const TOOL_RENDERERS: Record<
  string,
  React.ComponentType<{ part: ToolPart }>
> = {
  mcp_read: ReadToolDisplay,
  mcp_write: WriteToolDisplay,
  mcp_edit: EditToolDisplay,
  mcp_bash: BashToolDisplay,
  mcp_glob: GlobToolDisplay,
  mcp_grep: GrepToolDisplay,
  mcp_task: TaskToolDisplay,
  mcp_question: QuestionToolDisplay,
  mcp_webfetch: WebFetchToolDisplay,
  mcp_skill: SkillToolDisplay,
  mcp_todowrite: TodoWriteToolDisplay,
  // Also register without mcp_ prefix for direct tool names
  read: ReadToolDisplay,
  write: WriteToolDisplay,
  edit: EditToolDisplay,
  bash: BashToolDisplay,
  glob: GlobToolDisplay,
  grep: GrepToolDisplay,
  task: TaskToolDisplay,
  question: QuestionToolDisplay,
  webfetch: WebFetchToolDisplay,
  skill: SkillToolDisplay,
  todowrite: TodoWriteToolDisplay,
  todoread: TodoWriteToolDisplay,
};

export function ToolInvocation({ part }: ToolInvocationProps) {
  const Renderer = TOOL_RENDERERS[part.tool];

  if (Renderer) {
    return <Renderer part={part} />;
  }

  return <DefaultToolDisplay part={part} />;
}
