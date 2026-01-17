import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center p-5 bg-gray-50 dark:bg-gray-900">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          This screen doesn't exist.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="text-blue-500">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
