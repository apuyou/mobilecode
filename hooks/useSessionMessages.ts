import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useSessionMessages(server: Server, sessionId: string) {
  return useQuery({
    queryKey: ["server", server.url, "session", sessionId, "messages"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
      const messagesResult = await client.session.messages({
        sessionID: sessionId,
        limit: 100,
      });

      return messagesResult.data || [];
    },
    refetchInterval: 3000,
  });
}
