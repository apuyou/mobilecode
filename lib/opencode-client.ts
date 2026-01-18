import { createOpencodeClient, OpencodeClient } from "@opencode-ai/sdk";

export function createClient(
  baseUrl: string,
  directory?: string,
): OpencodeClient {
  return createOpencodeClient({
    baseUrl: baseUrl.replace(/\/$/, ""),
    directory,
  });
}

export type { OpencodeClient };
