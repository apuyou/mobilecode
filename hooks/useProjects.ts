import { useQuery } from "@tanstack/react-query";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useProjects(server: Server) {
  return useQuery({
    queryKey: ["server", server.url, "projects"],
    queryFn: async () => {
      const client = createClient({
        baseUrl: server.url,
        username: server.username,
        password: server.password,
      });
      const projectsResult = await client.project.list();

      if (projectsResult.error) {
        throw projectsResult.error;
      }

      return projectsResult.data || [];
    },
  });
}
