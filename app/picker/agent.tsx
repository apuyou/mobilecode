import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { usePickerStore } from "@/stores/picker";

export default function AgentPickerModal() {
  const agents = usePickerStore((s) => s.agents);
  const selectedAgent = usePickerStore((s) => s.selectedAgent);
  const setSelectedAgent = usePickerStore((s) => s.setSelectedAgent);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-2">
      {agents.map((agent) => (
        <Pressable
          key={agent.name}
          onPress={() => {
            setSelectedAgent(agent.name);
            router.back();
          }}
          className={`px-4 py-3 rounded-xl mx-2 mb-1 ${
            selectedAgent === agent.name
              ? "bg-blue-50 dark:bg-blue-900/30"
              : "active:bg-gray-100 dark:active:bg-gray-700"
          }`}
        >
          <Text
            className={`text-base capitalize ${
              selectedAgent === agent.name
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {agent.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
