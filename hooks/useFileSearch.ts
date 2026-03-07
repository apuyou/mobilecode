import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useFileSearch(
  serverUrl: string,
  projectPath: string | undefined,
  query: string,
) {
  return useQuery({
    queryKey: [
      "server",
      serverUrl,
      "project",
      projectPath,
      "fileSearch",
      query,
    ],
    queryFn: async () => {
      const client = createClient(serverUrl, projectPath);
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
