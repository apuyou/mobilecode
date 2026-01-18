import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { createClient } from "@/lib/opencode-client";
import { useProjects } from "@/hooks/useProjects";
import { Server } from "@/stores";

import type { Session } from "@opencode-ai/sdk/gen/types.gen";

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
    query: useProjects(server.url),
  }));

  const serverProjectPairs = useMemo(() => {
    return projectsResults.flatMap(({ server, query }) => {
      if (!query.data) {
        return [];
      }

      return query.data.map((project) => ({
        server,
        project,
      }));
    });
  }, [projectsResults]);

  const sessionsQueries = useQueries({
    queries: serverProjectPairs.map(({ server, project }) => ({
      queryKey: ["server", server.url, "project", project.path, "sessions"],
      queryFn: async () => {
        const client = createClient(server.url, project.path);
        const result = await client.session.list({
          query: { directory: project.path },
        });

        if (result.error) {
          throw result.error;
        }

        return {
          server,
          project,
          sessions: (result.data || []).map((s: Session) => ({
            id: s.id,
            title: s.title || `Session ${s.id.slice(0, 8)}`,
            updatedAt: new Date(s.time.updated).toISOString(),
          })),
        };
      },
      enabled: !!server,
    })),
  });

  const recentSessions = useMemo(() => {
    const sessions: RecentSession[] = [];

    sessionsQueries.forEach((query) => {
      if (!query.data || !query.data.sessions) {
        return;
      }

      query.data.sessions.forEach((session) => {
        sessions.push({
          serverId: query.data.server.id,
          serverName: query.data.server.name,
          projectId: query.data.project.id,
          projectName: query.data.project.name,
          projectIcon: query.data.project.icon,
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
  }, [sessionsQueries]);

  const isLoading =
    projectsResults.some((r) => r.query.isLoading) ||
    sessionsQueries.some((q) => q.isLoading);

  return { recentSessions, isLoading };
}
