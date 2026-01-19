import { createOpencodeClient, OpencodeClient } from "@opencode-ai/sdk/v2";

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
