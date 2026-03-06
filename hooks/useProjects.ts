import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";

export function useProjects(serverUrl: string) {
  return useQuery({
    queryKey: ["server", serverUrl, "projects"],
    queryFn: async () => {
      const client = createClient(serverUrl);
      const projectsResult = await client.project.list();

      if (projectsResult.error) {
        throw projectsResult.error;
      }

      return projectsResult.data || [];
    },
  });
}
