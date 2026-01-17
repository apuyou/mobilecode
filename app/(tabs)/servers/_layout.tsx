import { Stack } from "expo-router";

export default function ServersLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Servers",
        }}
      />
      <Stack.Screen
        name="[serverId]"
        options={{
          title: "Sessions",
        }}
      />
    </Stack>
  );
}
