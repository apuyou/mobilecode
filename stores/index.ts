import { randomUUID } from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/lib/mmkv";

const STORE_NAME = "mobilecode-store";

export interface Server {
  id: string;
  name: string;
  url: string;
  connectionMode: "direct" | "relay";
  publicKey?: string;
  secretKey?: string;
}

interface AppState {
  // Servers (persisted)
  servers: Server[];
  addServer: (server: Omit<Server, "id">) => void;
  updateServer: (id: string, updates: Partial<Server>) => void;
  removeServer: (id: string) => void;

  // Clear all data
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Servers
      servers: [],
      addServer: (server) =>
        set((state) => ({
          servers: [...state.servers, { ...server, id: randomUUID() }],
        })),
      updateServer: (id, updates) =>
        set((state) => ({
          servers: state.servers.map((s) =>
            s.id === id ? { ...s, ...updates } : s,
          ),
        })),
      removeServer: (id) =>
        set((state) => ({
          servers: state.servers.filter((s) => s.id !== id),
        })),

      // Clear all data
      clearAllData: () => {
        set({
          servers: [],
        });
        zustandStorage.removeItem(STORE_NAME);
      },
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        servers: state.servers,
      }),
    },
  ),
);
