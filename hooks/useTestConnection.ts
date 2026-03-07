import { useState } from "react";

import { createClient } from "@/lib/opencode-client";

interface TestConnectionOptions {
  url: string;
  username?: string;
  password?: string;
}

export function useTestConnection() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const testConnection = async (options: TestConnectionOptions) => {
    if (!options.url.trim()) {
      setError("Please enter a server URL");

      return false;
    }

    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const client = createClient({
        baseUrl: options.url.trim(),
        username: options.username,
        password: options.password,
      });
      const result = await client.session.list();

      if (result.data && !result.error) {
        setTestResult("success");

        return true;
      }

      setTestResult("error");
      setError("Could not connect to server");

      return false;
    } catch (err) {
      setTestResult("error");
      setError(err instanceof Error ? err.message : "Connection failed");

      return false;
    } finally {
      setTesting(false);
    }
  };

  const reset = () => {
    setTestResult(null);
    setError(null);
  };

  return {
    testing,
    testResult,
    error,
    testConnection,
    reset,
  };
}
