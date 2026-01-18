import { useMemo } from "react";

import { useProjects } from "@/hooks/useProjects";
import { useSessions } from "@/hooks/useSessions";
import { Server } from "@/stores";

export function useAllSessions(servers: Server[]) {
  const projectsResults = servers.map((server) => ({
    server,
    query: useProjects(server.url),
  }));

  const sessionsQueries = projectsResults.flatMap(({ server, query }) => {
    if (!query.data) {
      return [];
    }

    return query.data.map((project) => ({
      server,
      project,
      query: useSessions(server.url, project.path),
    }));
  });

  const recentSessions = useMemo(() => {
    return sessionsQueries
      .flatMap(({ server, project, query }) => {
        if (!query.data) {
          return [];
        }

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
  }, [sessionsQueries]);

  const isLoading =
    projectsResults.some((r) => r.query.isLoading) ||
    sessionsQueries.some((q) => q.query.isLoading);

  return { recentSessions, isLoading };
}
