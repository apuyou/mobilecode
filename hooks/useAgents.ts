import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useAgents(serverUrl: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "agents"],
    queryFn: async () => {
      const client = createClient(serverUrl);
      const result = await client.app.agents();

      return result.data || [];
    },
    select: (agents) => {
      return agents.filter((a) => {
        if (a.mode === "subagent") {
          return false;
        }

        const hidden = ["compaction", "title", "summary"];
        if (hidden.includes(a.name)) {
          return false;
        }

        return true;
      });
    },
  });
}
