import { useMemo } from "react";

import { useProjects } from "@/hooks/useProjects";
import { useSessions } from "@/hooks/useSessions";
import { Server } from "@/stores";

export interface RecentSession {
  serverId: string;
  serverName: string;
  projectId: string;
  projectName: string;
  projectIcon?: {
    color?: string;
    url?: string;
  };
  sessionId: string;
  sessionTitle: string;
  updatedAt: string;
}

export function useAllSessions(servers: Server[]) {
  const projectsResults = servers.map((server) => ({
    server,
    ...useProjects(server.url),
  }));

  const serverProjectPairs = useMemo(() => {
    return projectsResults.flatMap(({ server, data }) => {
      if (!data) {
        return [];
      }

      return data.map((project) => ({
        server,
        project,
      }));
    });
  }, [projectsResults]);

  const sessionsResults = serverProjectPairs.map(({ server, project }) => ({
    server,
    project,
    ...useSessions(server.url, project.path),
  }));

  const recentSessions = useMemo(() => {
    const sessions: RecentSession[] = [];

    sessionsResults.forEach(({ server, project, data }) => {
      if (!data) {
        return;
      }

      data.forEach((session) => {
        sessions.push({
          serverId: server.id,
          serverName: server.name,
          projectId: project.id,
          projectName: project.name,
          projectIcon: project.icon,
          sessionId: session.id,
          sessionTitle: session.title,
          updatedAt: session.updatedAt,
        });
      });
    });

    return sessions.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [sessionsResults]);

  const isLoading =
    projectsResults.some((q) => q.isLoading) ||
    sessionsResults.some((q) => q.isLoading);

  return { recentSessions, isLoading };
}
