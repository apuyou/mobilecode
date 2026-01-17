import { focusManager, onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";
import { useEffect } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

export function useReactQuerySetup() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onlineManager.setEventListener((setOnline) => {
      const eventSubscription = Network.addNetworkStateListener((state) => {
        setOnline(!!state.isConnected);
      });

      return eventSubscription.remove;
    });

    return unsubscribe;
  }, []);
}
