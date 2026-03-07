import { createOpencodeClient, OpencodeClient } from "@opencode-ai/sdk/v2";

interface CreateClientOptions {
  baseUrl: string;
  directory?: string;
  username?: string;
  password?: string;
}

export function createClient(options: CreateClientOptions): OpencodeClient {
  const headers: Record<string, string> = {};

  if (options.username || options.password) {
    const credentials = `${options.username || ""}:${options.password || ""}`;
    headers["Authorization"] = `Basic ${btoa(credentials)}`;
  }

  return createOpencodeClient({
    baseUrl: options.baseUrl.replace(/\/$/, ""),
    directory: options.directory,
    headers,
  });
}

export type { OpencodeClient };
