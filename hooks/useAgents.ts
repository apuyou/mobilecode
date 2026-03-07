import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useAgents(server: Server) {
  return useQuery({
    queryKey: ["server", server.url, "agents"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
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
