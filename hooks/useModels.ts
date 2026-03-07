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

      const connected = new Set(data.connected || []);

      return (data.all || [])
        .filter((p) => connected.has(p.id))
        .flatMap((p) =>
          Object.values(p.models || {}).map((m) => ({
            id: m.id,
            providerID: p.id,
            name: m.name,
          })),
        );
    },
  });
}
