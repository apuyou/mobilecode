import { useQueries } from "@tanstack/react-query";
import { Project, Session } from "@opencode-ai/sdk/v2";

import { createClient } from "@/lib/opencode-client";
import { Server } from "@/stores";

export function useAllSessions(servers: Server[]) {
  const projects = useQueries({
    queries: servers.map((server) => ({
      queryKey: ["server", server.url, "projects"],
      queryFn: async () => {
        const client = createClient(server.url);
        const projectsResult = await client.project.list();

        return projectsResult.data;
      },
      select: (data: Project[] | undefined) => {
        return data?.map((proj) => ({
          id: proj.id,
          name: proj.worktree?.split("/").pop() || proj.id,
          path: proj.worktree || proj.id,
          icon:
            "icon" in proj
              ? (proj.icon as { color?: string; url?: string })
              : undefined,
        }));
      },
    })),
    combine: (results) => {
      return results.flatMap((query, index) => {
        if (!query.data) {
          return [];
        }

        return query.data.map((project) => ({
          server: servers[index],
          project,
        }));
      });
    },
  });

  const { recentSessions, isLoading } = useQueries({
    queries: projects.map(({ server, project }) => ({
      queryKey: ["server", server.url, "project", project.path, "sessions"],
      queryFn: async () => {
        const client = createClient(server.url, project.path);
        const result = await client.session.list({
          directory: project.path,
        });

        return result.data;
      },
      select: (data: Session[] | undefined) => {
        return data
          ?.filter((s) => !s.parentID && !s.time.archived)
          .map((s) => ({
            id: s.id,
            title: s.title || `Session ${s.id.slice(0, 8)}`,
            updatedAt: new Date(s.time.updated).toISOString(),
            projectID: s.projectID,
            directory: s.directory,
          }));
      },
    })),
    combine: (results) => {
      const recentSessions = results
        .flatMap((query, index) => {
          if (!query.data) {
            return [];
          }

          const { server, project } = projects[index];

          return query.data.map((session) => ({
            serverId: server.id,
            serverName: server.name,
            projectId: project.id,
            projectName: project.name,
            projectIcon: project.icon,
            sessionId: session.id,
            sessionTitle: session.title,
            updatedAt: session.updatedAt,
          }));
        })
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );

      const isLoading = results.some((q) => q.isLoading);

      return { recentSessions, isLoading };
    },
  });

  return { recentSessions, isLoading };
}
