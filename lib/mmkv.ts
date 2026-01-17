import { createMMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

const storage = createMMKV({ id: "opencode-mobile-storage" });

export const zustandStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);

    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};
