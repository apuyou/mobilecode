import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useProjects(serverUrl?: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "projects"],
    queryFn: async () => {
      if (!serverUrl) {
        throw new Error("Server URL not provided");
      }

      const client = createClient(serverUrl);
      const projectsResult = await client.project.list();

      if (projectsResult.error) {
        throw projectsResult.error;
      }

      return projectsResult.data || [];
    },
    select: (data) => {
      return data.map((proj: any) => ({
        id: proj.id,
        name: proj.worktree?.split("/").pop() || proj.id,
        path: proj.worktree || proj.id,
        icon: proj.icon,
      }));
    },
    enabled: !!serverUrl,
  });
}
