"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ApiError, api, record, string } from "@/lib/api/client";
import { clientConfig } from "@/lib/config";
import type { Locale } from "@/lib/i18n";
import { dictionaries } from "@/lib/i18n";
import type { ConversationContext } from "@/lib/models/conversation";
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
import { modelMessages } from "./modelMessages";
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
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState("");
  const version = useRef(0);
  const refreshVersion = useRef(0);
  const importedSelection = useRef("");
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
    setGenerationError(null);
    api(`portfolios?clientId=${encodeURIComponent(clientId)}`)
      .then((data) => {
        if (!active) return;
        const values = parseSummaries(data);
        setSummaries(values);
        const preferred = values.find(
          (item) => item.id === importedSelection.current,
        );
        importedSelection.current = "";
        updatePortfolioId(preferred?.id ?? values[0]?.id ?? "");
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
    setGenerationError(null);
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
    if (id === clientId) return;
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
    if (id === portfolioId) return;
    version.current++;
    setPortfolio(null);
    setBriefing(null);
    updatePortfolioId(id);
    setLoading(true);
    setGenerating(false);
    setError(false);
  }
  async function refreshAfterImport(id = "", importedClientId?: string) {
    const current = version.current;
    const refresh = ++refreshVersion.current;
    const selectedClient = importedClientId || clientId;
    try {
      const [clientData, portfolioData, detail] = await Promise.all([
        api("clients"),
        api(`portfolios?clientId=${encodeURIComponent(selectedClient)}`),
        portfolioId &&
        selectedClient === clientId &&
        (!id || id === portfolioId)
          ? api(`portfolios/${encodeURIComponent(portfolioId)}`)
          : Promise.resolve(null),
      ]);
      if (current !== version.current || refresh !== refreshVersion.current)
        return;
      const clients = parseClients(clientData);
      setClients(clients);
      const values = parseSummaries(portfolioData);
      if (selectedClient !== clientId) {
        if (
          !clients.some((client) => client.id === selectedClient) ||
          !values.some((item) => item.id === id)
        )
          throw new Error("Imported context unavailable");
        importedSelection.current = id;
        setClientId(selectedClient);
        return;
      }
      setSummaries(values);
      if (id && values.some((item) => item.id === id) && id !== portfolioId)
        setPortfolioId(id);
      else if (detail) {
        const updated = parsePortfolio(detail);
        if (updated.id === portfolioId) setPortfolio(updated);
        setBriefing(null);
      }
    } catch {
      if (current === version.current) setError(true);
    }
  }
  async function generate(model?: string, context?: ConversationContext) {
    if (!portfolioId || generating) return;
    const current = version.current;
    setGenerating(true);
    setError(false);
    setGenerationError(null);
    try {
      const value = parseBriefing(
        await api("briefings", {
          method: "POST",
          body: JSON.stringify({ portfolioId, locale, ...context, model }),
        }),
      );
      if (current === version.current) setBriefing(value);
    } catch (reason) {
      if (current === version.current) {
        setError(true);
        setGenerationError(
          reason instanceof ApiError && reason.code === "MODEL_NOT_ALLOWED"
            ? modelMessages[locale].rejected
            : reason instanceof ApiError && reason.status === 503
              ? dictionaries[locale].providerUnavailable
              : dictionaries[locale].error,
        );
      }
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
    generationError,
    connected,
    user,
    generate,
    refreshAfterImport,
    signOut,
  };
}
