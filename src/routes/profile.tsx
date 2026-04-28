import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, Crown, TrendingUp, Calendar, Save, Eye, EyeOff } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";
import type { User } from "@supabase/supabase-js";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — ChessMind" }] }),
  component: ProfilePage,
});

type Game = {
  id: string;
  opponent: string;
  result: string;
  moves: number;
  created_at: string;
};

function translateOpponent(opponent: string, isRu: boolean): string {
  if (!isRu) return opponent;
  return opponent
    .replace("ChessMind AI (easy)", "ChessMind ИИ (лёгкий)")
    .replace("ChessMind AI (medium)", "ChessMind ИИ (средний)")
    .replace("ChessMind AI (hard)", "ChessMind ИИ (сложный)")
    .replace("ChessMind AI (beginner)", "ChessMind ИИ (новичок)")
    .replace("Friend (local)", "Друг (локально)");
   
}

function ProfilePage() {
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const { lang } = useLang();
  const isRu = lang === "ru";

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
     setUser(data.user);
  if (data.user) {
    supabase.from("profiles").upsert({
      id: data.user.id,
      email: data.user.email,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
    loadProfile(data.user.id);
  } else setLoading(false);
});
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();
    if (data?.username) setUsername(data.username);
    loadGames(userId);
  }

  async function loadGames(userId: string) {
    const { data } = await supabase
      .from("game_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    setGames(data ?? []);
    setLoading(false);
  }

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setSaveMsg(null);
    await supabase.from("profiles").upsert({
    id: user.id,
    username: username.trim(),
    email: user.email,
    updated_at: new Date().toISOString(),
    });
    if (newPassword.length >= 6) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setSaveMsg(isRu ? "Ошибка смены пароля: " + error.message : "Password error: " + error.message);
        setSaving(false);
        return;
      }
      setNewPassword("");
    }
    setSaveMsg(isRu ? "Сохранено!" : "Saved!");
    setSaving(false);
    setTimeout(() => setSaveMsg(null), 3000);
  }

  const wins = games.filter((g) => g.result === "Win").length;
  const losses = games.filter((g) => g.result === "Loss").length;
  const draws = games.filter((g) => g.result === "Draw").length;
  const winRate = games.length > 0 ? Math.round((wins / games.length) * 100) : 0;

  const initial = username?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "G";
  const displayName = username || user?.email || (isRu ? "Гость" : "Guest");

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(isRu ? "ru-RU" : "en-US", { month: "short", day: "numeric" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">

        <div className="bg-gradient-card flex flex-wrap items-center gap-6 rounded-2xl border border-border p-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-gold text-3xl font-bold text-primary-foreground shadow-gold">
            {initial}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold">{displayName}</h1>
            {user ? (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {isRu ? "Войдите чтобы сохранять игры." : "Sign in to save your games."}
                </p>
                <Link to="/auth" className="mt-3 inline-flex rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
                  {isRu ? "Войти" : "Sign in"}
                </Link>
              </>
            )}
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{isRu ? "Игр" : "Games"}</p>
            <p className="font-display text-4xl font-bold text-gold">{games.length}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Stat icon={Trophy} label={isRu ? "Победы" : "Wins"} value={String(wins)} />
          <Stat icon={TrendingUp} label={isRu ? "Поражения" : "Losses"} value={String(losses)} />
          <Stat icon={Calendar} label={isRu ? "Ничьи" : "Draws"} value={String(draws)} />
          <Stat icon={Crown} label={isRu ? "% побед" : "Win %"} value={`${winRate}%`} />
        </div>

        {user && (
          <div className="mt-8 rounded-2xl border border-border bg-gradient-card p-6">
            <h2 className="font-display text-xl font-semibold">
              {isRu ? "Настройки аккаунта" : "Account settings"}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {isRu ? "Имя пользователя" : "Username"}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={isRu ? "Придумай никнейм" : "Choose a username"}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  {isRu ? "Новый пароль" : "New password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRu ? "Минимум 6 символов" : "Min 6 characters"}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? (isRu ? "Сохранение..." : "Saving...") : (isRu ? "Сохранить" : "Save")}
              </button>
              {saveMsg && <p className="text-sm text-green-400">{saveMsg}</p>}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-gradient-card p-6">
          <h2 className="font-display text-xl font-semibold">
            {isRu ? "Последние игры" : "Recent games"}
          </h2>
          <div className="mt-4 divide-y divide-border/60 rounded-lg border border-border bg-background/40">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">{isRu ? "Загрузка..." : "Loading..."}</p>
            ) : !user ? (
              <p className="p-4 text-sm text-muted-foreground">{isRu ? "Войдите чтобы видеть историю." : "Sign in to see history."}</p>
            ) : games.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">{isRu ? "Игр пока нет. Сыграй первую!" : "No games yet. Play your first!"}</p>
            ) : (
              games.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{translateOpponent(g.opponent, isRu)}</p>
                    <p className="text-xs text-muted-foreground">{g.moves} {isRu ? "ходов" : "moves"} · {formatDate(g.created_at)}</p>
                  </div>
                  <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                    g.result === "Win" ? "bg-gold/15 text-gold" : g.result === "Loss" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
                  }`}>
                    {g.result === "Win" ? (isRu ? "Победа" : "Win") : g.result === "Loss" ? (isRu ? "Поражение" : "Loss") : (isRu ? "Ничья" : "Draw")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="bg-gradient-card rounded-xl border border-border p-5">
      <Icon className="h-5 w-5 text-gold" />
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}