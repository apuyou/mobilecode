import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SectionList, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ModelInfo } from "@/hooks/useModels";
import { usePickerStore } from "@/stores/picker";

export default function ModelPickerModal() {
  const models = usePickerStore((s) => s.models);
  const selectedModel = usePickerStore((s) => s.selectedModel);
  const setSelectedModel = usePickerStore((s) => s.setSelectedModel);
  const [search, setSearch] = useState("");

  const sections = useMemo(() => {
    const query = search.toLowerCase();
    const filtered = search
      ? models.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.providerID.toLowerCase().includes(query),
        )
      : models;

    const grouped = new Map<string, ModelInfo[]>();
    for (const model of filtered) {
      const existing = grouped.get(model.providerID);
      if (existing) {
        existing.push(model);
      } else {
        grouped.set(model.providerID, [model]);
      }
    }

    return Array.from(grouped.entries()).map(([providerID, data]) => ({
      title: providerID,
      data,
    }));
  }, [models, search]);

  return (
    <SectionList
      className="flex-1 bg-gray-50 dark:bg-gray-900 px-2"
      renderScrollComponent={(props) => (
        <KeyboardAwareScrollView {...props} extraKeyboardSpace={100} />
      )}
      sections={sections}
      keyExtractor={(item) => `${item.providerID}/${item.id}`}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View className="px-2 pb-2">
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search models..."
            className="bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-base text-gray-900 dark:text-gray-100"
            placeholderTextColor="#9ca3af"
            autoFocus
          />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View className="px-4 pt-3 pb-1 bg-gray-50 dark:bg-gray-900">
          <Text className="text-xs font-semibold text-gray-500 uppercase">
            {section.title}
          </Text>
        </View>
      )}
      renderItem={({ item: model }) => {
        const isSelected =
          selectedModel?.id === model.id &&
          selectedModel?.providerID === model.providerID;

        return (
          <Pressable
            onPress={() => {
              setSelectedModel(model);
              router.back();
            }}
            className={`px-4 py-3 rounded-xl mx-2 mb-0.5 ${
              isSelected
                ? "bg-blue-50 dark:bg-blue-900/30"
                : "active:bg-gray-100 dark:active:bg-gray-700"
            }`}
          >
            <Text
              className={`text-base ${
                isSelected
                  ? "text-blue-600 dark:text-blue-400 font-medium"
                  : "text-gray-900 dark:text-white"
              }`}
              numberOfLines={1}
            >
              {model.name}
            </Text>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <View className="px-4 py-6 items-center">
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            No models found
          </Text>
        </View>
      }
    />
  );
}
