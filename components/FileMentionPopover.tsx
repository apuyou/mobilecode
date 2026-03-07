import { File, Folder } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";

export interface FileMentionItem {
  path: string;
  isDirectory: boolean;
}

interface FileMentionPopoverProps {
  items: FileMentionItem[];
  activeIndex: number;
  onSelect: (item: FileMentionItem) => void;
  isLoading: boolean;
  query: string;
}

function getFilename(path: string) {
  const parts = path.split("/");

  return parts[parts.length - 1] || path;
}

function getDirectory(path: string) {
  const idx = path.lastIndexOf("/");
  if (idx < 0) {
    return "";
  }

  return path.slice(0, idx + 1);
}

export function FileMentionPopover({
  items,
  activeIndex,
  onSelect,
  isLoading,
  query,
}: FileMentionPopoverProps) {
  if (items.length === 0) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-3">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {isLoading ? "Searching..." : "No files found"}
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden max-h-48">
      <FlatList
        data={items.slice(0, 10)}
        keyExtractor={(item) => item.path}
        keyboardShouldPersistTaps="always"
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          const isDir = item.isDirectory;
          const directory = isDir ? item.path : getDirectory(item.path);
          const filename = isDir ? "" : getFilename(item.path);

          return (
            <Pressable
              onPress={() => onSelect(item)}
              className={`flex-row items-center gap-2 px-3 py-2 ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30"
                  : "active:bg-gray-100 dark:active:bg-gray-700"
              }`}
            >
              {isDir ? (
                <Folder size={16} color="#9ca3af" />
              ) : (
                <File size={16} color="#9ca3af" />
              )}
              <View className="flex-row flex-1 min-w-0">
                <Text
                  className="text-sm text-gray-400 dark:text-gray-500"
                  numberOfLines={1}
                >
                  {directory}
                </Text>
                {!isDir && (
                  <Text
                    className="text-sm text-gray-900 dark:text-gray-100"
                    numberOfLines={1}
                  >
                    {filename}
                  </Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}
