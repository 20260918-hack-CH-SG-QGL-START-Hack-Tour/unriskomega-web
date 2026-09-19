"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { api, record, string } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import {
  type Briefing,
  type Client,
  type Portfolio,
  type PortfolioSummary,
  parseBriefing,
  parseClients,
  parsePortfolio,
  parseSummaries,
} from "@/lib/models/portfolio";
export function useWorkspace(locale: Locale) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [summaries, setSummaries] = useState<PortfolioSummary[]>([]);
  const [clientId, updateClientId] = useState("");
  const [portfolioId, updatePortfolioId] = useState("");
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(false);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState("");
  const version = useRef(0);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    const expired = () => {
      version.current++;
      setClients([]);
      setSummaries([]);
      updatePortfolioId("");
      setPortfolio(null);
      setBriefing(null);
      router.replace("/login");
    };
    window.addEventListener("uro-session-expired", expired);
    return () => window.removeEventListener("uro-session-expired", expired);
  }, [router]);
  useEffect(() => {
    let active = true;
    Promise.all([api("auth/me"), api("clients")])
      .then(([identity, data]) => {
        if (!active) return;
        const u = record(identity);
        const expiresAt =
          typeof u.expiresAt === "number"
            ? u.expiresAt * 1000
            : Date.parse(string(u.expiresAt));
        if (!Number.isFinite(expiresAt))
          throw new Error("Invalid session expiry");
        expiryTimer.current = setTimeout(
          () => window.dispatchEvent(new Event("uro-session-expired")),
          Math.max(0, expiresAt - Date.now()),
        );
        setUser(string(record(u.user ?? u).name));
        const values = parseClients(data);
        setClients(values);
        updateClientId(values[0]?.id ?? "");
        if (!values.length) setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
      clearTimeout(expiryTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!clientId) return;
    let active = true;
    version.current++;
    setPortfolio(null);
    setBriefing(null);
    setLoading(true);
    setError(false);
    api(`portfolios?clientId=${encodeURIComponent(clientId)}`)
      .then((data) => {
        if (!active) return;
        const values = parseSummaries(data);
        setSummaries(values);
        updatePortfolioId(values[0]?.id ?? "");
        if (!values.length) setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [clientId]);
  useEffect(() => {
    if (!portfolioId) return;
    let active = true;
    const requestVersion = ++version.current;
    setPortfolio(null);
    setBriefing(null);
    setLoading(true);
    setError(false);
    api(`portfolios/${encodeURIComponent(portfolioId)}`)
      .then((data) => {
        if (active && requestVersion === version.current)
          setPortfolio(parsePortfolio(data));
      })
      .catch(() => {
        if (active && requestVersion === version.current) setError(true);
      })
      .finally(() => {
        if (active && requestVersion === version.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [portfolioId]);
  useEffect(() => {
    if (!portfolioId) return;
    const socketVersion = version.current;
    let closed = false;
    let timer: ReturnType<typeof setTimeout>;
    let socket: WebSocket;
    let heartbeat: ReturnType<typeof setInterval>;
    const connect = () => {
      const url = new URL(clientConfig.socketPath, location.origin);
      url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
      url.searchParams.set("portfolioId", portfolioId);
      socket = new WebSocket(url);
      socket.onopen = () => {
        if (closed || socketVersion !== version.current) {
          socket.close();
          return;
        }
        setConnected(true);
        socket.send(JSON.stringify({ type: "ping" }));
        heartbeat = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN)
            socket.send(JSON.stringify({ type: "ping" }));
        }, 25000);
      };
      socket.onmessage = (event) => {
        if (closed || socketVersion !== version.current) return;
        try {
          const data = record(JSON.parse(event.data));
          if (data.type === "connected") setConnected(true);
          if (
            data.type === "error" &&
            record(data.data).code === "SESSION_EXPIRED"
          )
            window.dispatchEvent(new Event("uro-session-expired"));
          if (data.type === "snapshot") {
            const updated = parsePortfolio(data.data);
            if (updated.id === portfolioId) setPortfolio(updated);
          }
        } catch {
          console.warn("Invalid realtime event rejected");
        }
      };
      socket.onclose = () => {
        clearInterval(heartbeat);
        if (!closed && socketVersion === version.current) {
          setConnected(false);
          timer = setTimeout(connect, 5000);
        }
      };
    };
    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      clearInterval(heartbeat);
      socket?.close();
      setConnected(false);
    };
  }, [portfolioId]);
  function setClientId(id: string) {
    version.current++;
    setPortfolio(null);
    setBriefing(null);
    setSummaries([]);
    updatePortfolioId("");
    updateClientId(id);
    setLoading(true);
    setGenerating(false);
    setError(false);
  }
  function setPortfolioId(id: string) {
    version.current++;
    setPortfolio(null);
    setBriefing(null);
    updatePortfolioId(id);
    setLoading(true);
    setGenerating(false);
    setError(false);
  }
  async function refreshAfterImport(id: string) {
    const current = version.current;
    try {
      const [clientData, portfolioData] = await Promise.all([
        api("clients"),
        api(`portfolios?clientId=${encodeURIComponent(clientId)}`),
      ]);
      if (current !== version.current) return;
      setClients(parseClients(clientData));
      const values = parseSummaries(portfolioData);
      setSummaries(values);
      if (id && values.some((item) => item.id === id) && id !== portfolioId)
        setPortfolioId(id);
    } catch {
      if (current === version.current) setError(true);
    }
  }
  async function generate() {
    if (!portfolioId || generating) return;
    const current = version.current;
    setGenerating(true);
    setError(false);
    try {
      const value = parseBriefing(
        await api("briefings", {
          method: "POST",
          body: JSON.stringify({ portfolioId, locale }),
        }),
      );
      if (current === version.current) setBriefing(value);
    } catch {
      if (current === version.current) setError(true);
    } finally {
      if (current === version.current) setGenerating(false);
    }
  }
  async function signOut() {
    try {
      await api("auth/logout", { method: "POST", body: "{}" });
    } finally {
      version.current++;
      setClients([]);
      setSummaries([]);
      updatePortfolioId("");
      setPortfolio(null);
      setBriefing(null);
      router.replace("/login");
    }
  }
  return {
    clients,
    summaries,
    clientId,
    setClientId,
    portfolioId,
    setPortfolioId,
    portfolio,
    briefing,
    loading,
    generating,
    error,
    connected,
    user,
    generate,
    refreshAfterImport,
    signOut,
  };
}
