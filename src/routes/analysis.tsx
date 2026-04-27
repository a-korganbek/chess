import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, AlertTriangle, TrendingUp, Crown, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";

export const Route = createFileRoute("/analysis")({
  head: () => ({ meta: [{ title: "AI Coach — ChessMind" }] }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { lang } = useLang();
  const isRu = lang === "ru";
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [moves, setMoves] = useState(() => sessionStorage.getItem("chessmind_pgn") ?? "");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return; }
      supabase.from("profiles").select("is_pro").eq("id", data.user.id).single()
        .then(({ data: p }) => { setIsPro(p?.is_pro ?? false); setLoading(false); });
    });
  }, []);

  async function analyze() {
  if (!moves.trim()) return;
  setAnalyzing(true);
  setAnalysis(null);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Ты шахматный тренер. Проанализируй партию (ходы: ${moves}). 
          Укажи: 1) главные ошибки белых, 2) главные ошибки чёрных, 3) ключевой момент, 4) совет для улучшения.
          Отвечай ${isRu ? "на русском" : "на английском"}, кратко и по делу.`
        }]
      })
    });
    const data = await res.json();
    setAnalysis(data.content?.[0]?.text ?? (isRu ? "Ошибка анализа" : "Analysis error"));
  } catch (e) {
    setAnalysis(isRu ? "Ошибка соединения. Попробуй снова." : "Connection error. Try again.");
  }
  setAnalyzing(false);
}

  if (loading) return <div className="flex min-h-screen flex-col bg-background"><Navbar /></div>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">AI Coach</h1>
            <p className="text-sm text-muted-foreground">
              {isRu ? "Глубокий анализ твоей партии" : "Deep analysis of your game"}
            </p>
          </div>
          {isPro && (
            <span className="ml-auto flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-gold">
              <Crown className="h-3 w-3" /> Pro
            </span>
          )}
        </div>

        {!isPro ? (
          <div className="mt-10 rounded-2xl border border-gold/30 bg-gradient-card p-10 text-center">
            <Lock className="mx-auto h-10 w-10 text-gold mb-4" />
            <h2 className="font-display text-2xl font-bold">
              {isRu ? "Только для Pro" : "Pro feature"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isRu ? "AI Coach доступен только Pro пользователям." : "AI Coach is available for Pro users only."}
            </p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-6 py-3 font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
              <Crown className="h-4 w-4" />
              {isRu ? "Улучшить до Pro" : "Upgrade to Pro"}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-border bg-gradient-card p-6">
              <label className="mb-2 block text-sm font-medium">
                {isRu ? "Вставь ходы партии (например: 1. e4 e5 2. Nf3 Nc6...)" : "Paste game moves (e.g. 1. e4 e5 2. Nf3 Nc6...)"}
              </label>
              <textarea
                value={moves}
                onChange={(e) => setMoves(e.target.value)}
                rows={5}
                placeholder="1. e4 e5 2. Nf3 Nc6 3. Bb5..."
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
              />
              <button
                onClick={analyze}
                disabled={analyzing || !moves.trim()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-5 py-2.5 font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90 disabled:opacity-60"
              >
                <Brain className="h-4 w-4" />
                {analyzing ? (isRu ? "Анализирую..." : "Analyzing...") : (isRu ? "Анализировать" : "Analyze")}
              </button>
            </div>

            {analysis && (
              <div className="rounded-2xl border border-gold/30 bg-gradient-card p-6">
                <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-gold" />
                  {isRu ? "Анализ тренера" : "Coach Analysis"}
                </h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}