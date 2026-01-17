import { router } from "expo-router";
import { Plus } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ServerCard } from "@/components/ServerCard";
import { useAppStore } from "@/stores";

export default function ServersScreen() {
  const servers = useAppStore((s) => s.servers);

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="p-4">
        <Pressable
          onPress={() => router.push("/server/new")}
          className="bg-blue-500 rounded-xl p-4 flex-row items-center justify-center mb-4"
        >
          <Plus size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Server</Text>
        </Pressable>

        {servers.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-center">
              No servers configured.{"\n"}Add a server to get started.
            </Text>
          </View>
        ) : (
          servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onPress={() => router.push(`/server/${server.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
