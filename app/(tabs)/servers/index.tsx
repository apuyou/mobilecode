import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { FlatList, Pressable, Text, View } from "react-native";

import { ServerCard } from "@/components/ServerCard";
import { useAppStore } from "@/stores";

export default function ServersScreen() {
  const servers = useAppStore((s) => s.servers);

  return (
    <FlatList
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
      data={servers}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ServerCard
          server={item}
          onPress={() => router.push(`/(tabs)/servers/${item.id}`)}
        />
      )}
      ListHeaderComponent={
        <Pressable
          onPress={() => router.push("/server/new")}
          className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center mb-4"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Server</Text>
        </Pressable>
      }
      ListEmptyComponent={
        <View className="items-center py-12">
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            No servers configured.{"\n"}Add a server to get started.
          </Text>
        </View>
      }
    />
  );
}
