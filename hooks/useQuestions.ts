import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useQuestions(server: Server, sessionId: string) {
  return useQuery({
    queryKey: ["server", server.url, "session", sessionId, "questions"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
      const result = await client.question.list();

      const all = result.data ?? [];

      return all.filter((q) => q.sessionID === sessionId);
    },
    refetchInterval: 1500,
  });
}
