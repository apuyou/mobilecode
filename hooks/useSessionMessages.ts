import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useSessionMessages(serverUrl: string, sessionId: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "session", sessionId, "messages"],
    queryFn: async () => {
      const client = createClient(serverUrl);
      const messagesResult = await client.session.messages({
        path: { id: sessionId },
        query: { limit: 100 },
      });

      return messagesResult.data || [];
    },
    refetchInterval: 3000,
  });
}
