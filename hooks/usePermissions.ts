import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function usePermissions(server: Server, sessionId: string) {
  return useQuery({
    queryKey: ["server", server.url, "session", sessionId, "permissions"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
      const result = await client.permission.list();

      const all = result.data ?? [];

      return all.filter((p) => p.sessionID === sessionId);
    },
    refetchInterval: 1500,
  });
}
