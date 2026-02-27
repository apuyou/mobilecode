import { create } from "zustand";

import { ModelInfo } from "@/hooks/useModels";

interface PickerState {
  // Server URL for fetching data
  serverUrl: string;
  setServerUrl: (url: string) => void;

  // Agent picker
  agents: { name: string }[];
  selectedAgent: string;
  setAgents: (agents: { name: string }[]) => void;
  setSelectedAgent: (agent: string) => void;

  // Model picker
  models: ModelInfo[];
  selectedModel: ModelInfo | undefined;
  setModels: (models: ModelInfo[]) => void;
  setSelectedModel: (model: ModelInfo) => void;
}

export const usePickerStore = create<PickerState>()((set) => ({
  serverUrl: "",
  setServerUrl: (url) => set({ serverUrl: url }),

  agents: [],
  selectedAgent: "build",
  setAgents: (agents) => set({ agents }),
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),

  models: [],
  selectedModel: undefined,
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}));
