import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Crown } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — ChessMind" }] }),
  component: LeaderboardPage,
});

type Player = {
  user_id: string;
  email: string;
  wins: number;
  total: number;
  wr: number;
};

function LeaderboardPage() {
  const { lang } = useLang();
  const isRu = lang === "ru";
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   async function loadLeaderboard() {
  const { data } = await supabase
    .from("game_history")
    .select("user_id, result");

  if (!data) { setLoading(false); return; }

  const map: Record<string, { wins: number; total: number }> = {};
  for (const row of data) {
    if (!map[row.user_id]) map[row.user_id] = { wins: 0, total: 0 };
    map[row.user_id].total++;
    if (row.result === "Win") map[row.user_id].wins++;
  }

  // Получаем usernames из profiles
  const userIds = Object.keys(map);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", userIds);

  const profileMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    if (p.username) profileMap[p.id] = p.username;
  }
  const { data: { user } } = await supabase.auth.getUser();
  const list: Player[] = Object.entries(map).map(([user_id, stats]) => ({
    user_id,
    email: profileMap[user_id] ?? (user?.id === user_id ? (user?.email ?? user_id.slice(0, 8) + "...") : user_id.slice(0, 8) + "..."),
    wins: stats.wins,
    total: stats.total,
    wr: Math.round((stats.wins / stats.total) * 100),
  })).sort((a, b) => b.wins - a.wins);

  setPlayers(list);
  setLoading(false);
}
loadLeaderboard();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-gold shadow-gold">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">
              {isRu ? "Глобальный рейтинг" : "Global Leaderboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isRu ? "Сильнейшие игроки ChessMind прямо сейчас." : "The strongest minds on ChessMind right now."}
            </p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-gradient-card">
          <div className="grid grid-cols-[60px_1fr_100px_80px_80px] gap-2 border-b border-border bg-background/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid-cols-[60px_1fr_120px_120px_100px]">
            <div>{isRu ? "Место" : "Rank"}</div>
            <div>{isRu ? "Игрок" : "Player"}</div>
            <div className="text-right">{isRu ? "Победы" : "Wins"}</div>
            <div className="hidden text-right sm:block">{isRu ? "Игры" : "Games"}</div>
            <div className="text-right">{isRu ? "процент побед" : "Win %"}</div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">{isRu ? "Загрузка..." : "Loading..."}</p>
          ) : players.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">
              {isRu ? "Пока нет данных. Сыграй первую игру!" : "No data yet. Play your first game!"}
            </p>
          ) : (
            players.map((p, i) => (
              <div key={p.user_id} className="grid grid-cols-[60px_1fr_100px_80px_80px] items-center gap-2 border-b border-border/40 px-4 py-3 text-sm transition-smooth last:border-0 hover:bg-accent/30 sm:grid-cols-[60px_1fr_120px_120px_100px]">
                <div className="flex items-center gap-1.5">
                  {i < 3 ? <Crown className={`h-4 w-4 ${i === 0 ? "text-gold" : i === 1 ? "text-muted-foreground" : "text-amber-700"}`} /> : null}
                  <span className="font-bold">{i + 1}</span>
                </div>
                <div className="font-medium">{p.email}</div>
                <div className="text-right font-mono font-semibold text-gold">{p.wins}</div>
                <div className="hidden text-right text-muted-foreground sm:block">{p.total}</div>
                <div className="text-right font-mono">{p.wr}%</div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}