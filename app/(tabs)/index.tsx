import { Text, View } from "react-native";

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center p-4">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Dashboard
      </Text>
    </View>
  );
}
