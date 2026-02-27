import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, SectionList, Text, TextInput, View } from "react-native";

import { ModelInfo } from "@/hooks/useModels";
import { usePickerStore } from "@/stores/picker";

const ITEM_HEIGHT = 49;
const SECTION_HEADER_HEIGHT = 32;

export default function ModelPickerModal() {
  const models = usePickerStore((s) => s.models);
  const selectedModel = usePickerStore((s) => s.selectedModel);
  const setSelectedModel = usePickerStore((s) => s.setSelectedModel);
  const [modelSearch, setModelSearch] = useState("");

  const modelSections = useMemo(() => {
    const search = modelSearch.toLowerCase();
    const filtered = models.filter((m) => {
      if (!modelSearch) {
        return true;
      }

      return (
        m.name.toLowerCase().includes(search) ||
        m.providerID.toLowerCase().includes(search)
      );
    });

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
  }, [models, modelSearch]);

  const selectedFlatIndex = useMemo(() => {
    if (!selectedModel || modelSearch) {
      return undefined;
    }

    let flatIndex = 0;
    for (const section of modelSections) {
      flatIndex++;
      for (const model of section.data) {
        if (
          model.id === selectedModel.id &&
          model.providerID === selectedModel.providerID
        ) {
          return flatIndex;
        }
        flatIndex++;
      }
    }

    return undefined;
  }, [selectedModel, modelSections, modelSearch]);

  return (
    <View className="flex-1 bg-white dark:bg-gray-800">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Model
        </Text>
      </View>
      <View className="px-4 pb-2">
        <TextInput
          value={modelSearch}
          onChangeText={setModelSearch}
          placeholder="Search models..."
          className="bg-gray-100 dark:bg-gray-900 rounded-xl px-4 py-2.5 text-base text-gray-900 dark:text-gray-100"
          placeholderTextColor="#9ca3af"
          autoFocus
        />
      </View>
      <SectionList
        className="px-2"
        sections={modelSections}
        keyExtractor={(item) => `${item.providerID}/${item.id}`}
        keyboardShouldPersistTaps="handled"
        initialScrollIndex={selectedFlatIndex}
        getItemLayout={(_data, index) => {
          let offset = 0;
          let i = 0;
          for (const section of modelSections) {
            if (i === index) {
              return { length: SECTION_HEADER_HEIGHT, offset, index };
            }
            offset += SECTION_HEADER_HEIGHT;
            i++;
            for (let j = 0; j < section.data.length; j++) {
              if (i === index) {
                return { length: ITEM_HEIGHT, offset, index };
              }
              offset += ITEM_HEIGHT;
              i++;
            }
          }

          return { length: ITEM_HEIGHT, offset, index };
        }}
        renderSectionHeader={({ section }) => (
          <View className="px-4 pt-3 pb-1 bg-white dark:bg-gray-800">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">
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
    </View>
  );
}
