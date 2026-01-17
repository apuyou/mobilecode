import { useState } from "react";

import { OpenCodeClient } from "@/lib/opencode-client";

export function useTestConnection() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const testConnection = async (url: string) => {
    if (!url.trim()) {
      setError("Please enter a server URL");
      return false;
    }

    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      const client = new OpenCodeClient(url.trim());
      const success = await client.testConnection();

      if (success) {
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
