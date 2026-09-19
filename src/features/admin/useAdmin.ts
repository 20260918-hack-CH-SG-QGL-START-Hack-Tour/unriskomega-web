"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, record, string } from "@/lib/api/client";
import {
  type AdminCatalog,
  parseAdminCatalog,
  parseOutcomes,
  parseRuntime,
  type RuntimeOutcome,
  type RuntimeRegistry,
} from "@/lib/models/admin";

export function useAdmin() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<AdminCatalog | null>(null);
  const [runtime, setRuntime] = useState<RuntimeRegistry | null>(null);
  const [outcomes, setOutcomes] = useState<RuntimeOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [outcomeError, setOutcomeError] = useState(false);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clear = useCallback(() => {
    generation.current++;
    clearTimeout(timer.current);
    setCatalog(null);
    setRuntime(null);
    setOutcomes([]);
  }, []);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setError(false);
    setOutcomeError(false);
    try {
      const identity = record(await api("auth/me"));
      if (request !== generation.current) return;
      const expiry = Date.parse(string(identity.expiresAt));
      if (!Number.isFinite(expiry)) throw new Error("Invalid session expiry");
      clearTimeout(timer.current);
      timer.current = setTimeout(
        () => window.dispatchEvent(new Event("uro-session-expired")),
        Math.max(0, expiry - Date.now()),
      );
      const results = await Promise.allSettled([
        api("admin/catalog").then(parseAdminCatalog),
        api("admin/runtime").then(parseRuntime),
        api("admin/outcomes").then(parseOutcomes),
      ]);
      if (request !== generation.current) return;
      setCatalog(results[0].status === "fulfilled" ? results[0].value : null);
      setError(results[0].status === "rejected");
      setRuntime(results[1].status === "fulfilled" ? results[1].value : null);
      setOutcomes(results[2].status === "fulfilled" ? results[2].value : []);
      setOutcomeError(results[2].status === "rejected");
    } catch {
      if (request === generation.current) {
        setError(true);
        setCatalog(null);
        setRuntime(null);
        setOutcomes([]);
      }
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const expired = () => {
      clear();
      router.replace("/login");
    };
    window.addEventListener("uro-session-expired", expired);
    void refresh();
    return () => {
      window.removeEventListener("uro-session-expired", expired);
      clear();
    };
  }, [clear, refresh, router]);
  async function signOut() {
    clear();
    try {
      await api("auth/logout", { method: "POST", body: "{}" });
    } finally {
      window.dispatchEvent(new Event("uro-session-expired"));
      router.replace("/login");
    }
  }
  return {
    catalog,
    runtime,
    outcomes,
    loading,
    error,
    outcomeError,
    refresh,
    signOut,
  };
}
