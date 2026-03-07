import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useFileSearch(
  server: Server,
  projectPath: string | undefined,
  query: string,
) {
  return useQuery({
    queryKey: [
      "server",
      server.url,
      "project",
      projectPath,
      "fileSearch",
      query,
    ],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        directory: projectPath,
        username: server.username,
        password: server.password,
      });
      const result = await client.find.files({
        query,
        dirs: "true",
      });

      return result.data || [];
    },
    enabled: !!projectPath,
    staleTime: 10_000,
  });
}
