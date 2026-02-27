import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export interface ModelInfo {
  id: string;
  providerID: string;
  name: string;
}

export function useModels(serverUrl: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "providers"],
    queryFn: async () => {
      const client = createClient(serverUrl);
      const result = await client.provider.list();

      return result.data;
    },
    select: (data) => {
      if (!data) {
        return [];
      }

      const connectedProviders = new Set(data.connected || []);
      const allModels: ModelInfo[] = [];

      for (const provider of data.all || []) {
        if (!connectedProviders.has(provider.id)) {
          continue;
        }

        for (const model of Object.values(provider.models || {})) {
          allModels.push({
            id: model.id,
            providerID: provider.id,
            name: model.name,
          });
        }
      }

      return allModels;
    },
  });
}
