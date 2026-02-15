import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useSessions(serverUrl: string, projectPath?: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "project", projectPath, "sessions"],
    queryFn: async () => {
      const client = createClient(serverUrl, projectPath);
      const result = await client.session.list({
        directory: projectPath,
      });

      return result.data || [];
    },
    select: (data) => {
      return data
        .filter((s) => !s.parentID && !s.time.archived)
        .map((s) => ({
          id: s.id,
          title: s.title || `Session ${s.id.slice(0, 8)}`,
          updatedAt: new Date(s.time.updated).toISOString(),
          projectID: s.projectID,
          directory: s.directory,
        }));
    },
  });
}
