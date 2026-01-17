import { createOpencodeClient, OpencodeClient } from "@opencode-ai/sdk";

/**
 * Wrapper around the official OpenCode SDK client
 */
export class OpenCodeClientWrapper {
  private client: OpencodeClient;

  constructor(baseUrl: string) {
    this.client = createOpencodeClient({
      baseUrl: baseUrl.replace(/\/$/, ""),
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.client.session.list();

      return !result.error;
    } catch {
      return false;
    }
  }

  getClient(): OpencodeClient {
    return this.client;
  }
}

// Client cache
const clientCache = new Map<string, OpenCodeClientWrapper>();

export function getClient(baseUrl: string): OpenCodeClientWrapper {
  if (!clientCache.has(baseUrl)) {
    clientCache.set(baseUrl, new OpenCodeClientWrapper(baseUrl));
  }

  return clientCache.get(baseUrl)!;
}

export function clearClientCache(baseUrl?: string): void {
  if (baseUrl) {
    clientCache.delete(baseUrl);
  } else {
    clientCache.clear();
  }
}

// Re-export the SDK client type for direct usage
export type { OpencodeClient };
