import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { Bot, Users, RotateCcw, Flag, Crown, Clock, Brain, Pause, Play } from "lucide-react";
import { getBestMove, type Difficulty } from "@/lib/chessEngine";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Play Chess — ChessMind" },
      { name: "description", content: "Play chess vs an adaptive AI or pass-and-play with a friend." },
    ],
  }),
  component: PlayPage,
});

type Mode = "ai" | "friend";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function saveGame(opponent: string, result: string, moves: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("game_history").insert({
    user_id: user.id,
    opponent,
    result,
    moves,
  });
}

function PlayPage() {
  const { lang } = useLang();
  const isRu = lang === "ru";
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, object>>({});
  const [mode, setMode] = useState<Mode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [game, setGame] = useState(() => {
    const saved = sessionStorage.getItem("chessmind_fen");
    return saved ? new Chess(saved) : new Chess();
  });
  const [fen, setFen] = useState(() => {
    return sessionStorage.getItem("chessmind_fen") ?? new Chess().fen();
  });
  const [history, setHistory] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const gameSavedRef = useRef(false);
  const historyRef = useRef<string[]>([]);

  const playerColor: "w" = "w";
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    if (gameOver || paused) return;
    setWhiteTime(600);
    setBlackTime(600);
  }, [fen]);

  useEffect(() => {
    if (gameOver || paused) return;
    const interval = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((t) => {
          const next = t <= 1 ? 0 : t - 1;
          if (t <= 1) setGameOver(isRu ? "Чёрные выиграли по времени" : "Black wins on time");
          return next;
        });
      } else {
        setBlackTime((t) => {
          const next = t <= 1 ? 0 : t - 1;
          if (t <= 1) setGameOver(isRu ? "Белые выиграли по времени" : "White wins on time");
          return next;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [game, gameOver, paused, isRu]);

  useEffect(() => {
    if (game.isCheckmate()) setGameOver(isRu ? `Мат — ${game.turn() === "w" ? "Чёрные" : "Белые"} победили` : `Checkmate — ${game.turn() === "w" ? "Black" : "White"} wins`);
    else if (game.isStalemate()) setGameOver(isRu ? "Пат — Ничья" : "Stalemate — Draw");
    else if (game.isDraw()) setGameOver(isRu ? "Ничья" : "Draw");
  }, [fen, game, isRu]);

  useEffect(() => {
    if (!gameOver || gameSavedRef.current) return;
    gameSavedRef.current = true;
    sessionStorage.removeItem("chessmind_fen");
    const opponent = mode === "ai" ? `ChessMind AI (${difficulty})` : "Friend (local)";

    // Определяем результат более точно
let result = "Draw";
const g = gameOver.toLowerCase();

// Условия победы (если белые выиграли или черные сдались/проиграли по времени)
const whiteWon = g.includes("white wins") || g.includes("белые победили") || g.includes("белые выиграли");
const blackResigned = (g.includes("black resigned") || g.includes("чёрные сдались")) && mode === "friend";
const aiResigned = g.includes("ai wins") === false && (g.includes("resigned") || g.includes("сдались")) && mode === "ai"; // Для режима против ИИ обычно сдается только игрок, но на будущее

if (whiteWon || blackResigned) {
  result = "Win";
} else if (
  g.includes("black wins") || 
  g.includes("чёрные победили") || 
  g.includes("чёрные выиграли") ||
  g.includes("ai wins") ||
  g.includes("ии победил") ||
  (g.includes("you resigned") || g.includes("вы сдались")) ||
  (g.includes("white resigned") || g.includes("белые сдались"))
) {
  result = "Loss";
}

    saveGame(opponent, result, historyRef.current.length);
  }, [gameOver, mode, difficulty]);

  useEffect(() => {
    if (mode !== "ai" || gameOver || paused) return;
    if (game.turn() === playerColor) return;
    setThinking(true);
    const id = setTimeout(() => {
      const move = getBestMove(gameRef.current.fen(), difficulty);
      if (move) {
        const next = new Chess(gameRef.current.fen());
        next.move({ from: move.from, to: move.to, promotion: move.promotion });
        setGame(next);
        setFen(next.fen());
        setHistory(next.history());
        historyRef.current = next.history();
        sessionStorage.setItem("chessmind_fen", next.fen());
      }
      setThinking(false);
    }, 350);
    return () => clearTimeout(id);
  }, [fen, mode, difficulty, gameOver, paused, game]);

  function tryMove(from: string, to: string): boolean {
    if (gameOver || paused) return false;
    if (mode === "ai" && game.turn() !== playerColor) return false;
    const next = new Chess(game.fen());
    try {
      const move = next.move({ from, to, promotion: "q" });
      if (!move) return false;
    } catch {
      return false;
    }
    setGame(next);
    setFen(next.fen());
    setHistory(next.history());
    historyRef.current = next.history();
    sessionStorage.setItem("chessmind_fen", next.fen());
    return true;
  }

  function reset() {
    const fresh = new Chess();
    setGame(fresh);
    setFen(fresh.fen());
    setHistory([]);
    historyRef.current = [];
    setWhiteTime(600);
    setBlackTime(600);
    setGameOver(null);
    setPaused(false);
    gameSavedRef.current = false;
    sessionStorage.removeItem("chessmind_fen");
  }

  function resign() {
    if (gameOver) return;
    if (mode === "ai") {
      setGameOver(isRu ? "Вы сдались — ИИ победил" : "You resigned — AI wins");
    } else {
      
      const winner = game.turn() === "w" ? (isRu ? "Чёрные" : "Black") : (isRu ? "Белые" : "White");
      const loser = game.turn() === "w" ? (isRu ? "Белые" : "White") : (isRu ? "Чёрные" : "Black");
      setGameOver(isRu ? `${loser} сдались — ${winner} победили` : `${loser} resigned — ${winner} wins`);
    }
  }

  function onSquareClick({ square }: { square: string }) {
    if (gameOver || paused) return;
    if (mode === "ai" && game.turn() !== playerColor) return;

    const piece = game.get(square as any);

    if (selectedSquare) {
      const moved = tryMove(selectedSquare, square);
      if (moved) {
        setSelectedSquare(null);
        setHighlightedSquares({});
        return;
      }
    }

    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      if (hintsEnabled) {
        const moves = game.moves({ square: square as any, verbose: true });
        const highlights: Record<string, object> = {
          [square]: { backgroundColor: "oklch(0.75 0.15 85 / 0.5)" },
        };
        moves.forEach((m) => {
          highlights[m.to] = { backgroundColor: "oklch(0.65 0.15 85 / 0.35)", borderRadius: "50%" };
        });
        setHighlightedSquares(highlights);
      } else {
        setHighlightedSquares({});
      }
    } else {
      setSelectedSquare(null);
      setHighlightedSquares({});
    }
  }

  const turnLabel = isRu
    ? (game.turn() === "w" ? "Ход белых" : "Ход чёрных")
    : (game.turn() === "w" ? "White to move" : "Black to move");

  const difficultyLabel: Record<Difficulty, string> = {
    easy: isRu ? "Лёгкий" : "Easy",
    medium: isRu ? "Средний" : "Medium",
    hard: isRu ? "Сложный" : "Hard"
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <ModeButton active={mode === "ai"} onClick={() => { setMode("ai"); reset(); }} icon={Bot} label={isRu ? "против ИИ" : "vs AI"} />
              <ModeButton active={mode === "friend"} onClick={() => { setMode("friend"); reset(); }} icon={Users} label={isRu ? "против друга" : "vs Friend"} />
              {mode === "ai" && (
                <div className="ml-auto flex gap-1 rounded-lg border border-border bg-secondary p-1">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); reset(); }}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-smooth ${
                        difficulty === d ? "bg-gradient-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {difficultyLabel[d]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <PlayerBar name={mode === "ai" ? "ChessMind AI" : (isRu ? "Чёрные" : "Black")} time={blackTime} active={game.turn() === "b" && !gameOver && !paused} />

            <div className="relative mt-3 rounded-2xl border border-border bg-card p-3 shadow-elegant">
              <Chessboard
                options={{
                  position: fen,
                  onPieceDrop: ({ sourceSquare, targetSquare }) => {
                    if (!targetSquare) return false;
                    return tryMove(sourceSquare, targetSquare);
                  },
                  boardOrientation: "white",
                  animationDurationInMs: 200,
                  darkSquareStyle: { backgroundColor: "oklch(0.42 0.06 50)" },
                  lightSquareStyle: { backgroundColor: "oklch(0.86 0.03 85)" },
                  id: "chessmind-board",
                  onSquareClick: onSquareClick,
                  squareStyles: highlightedSquares,
                }}
              />
              {thinking && !paused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/30 backdrop-blur-[2px]">
                  <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-background/90 px-4 py-2 text-sm text-gold shadow-gold">
                    <Brain className="h-4 w-4 animate-pulse" /> {isRu ? "ИИ думает…" : "AI is thinking…"}
                  </div>
                </div>
              )}
              {paused && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[4px]">
                  <div className="text-center">
                    <Pause className="mx-auto h-10 w-10 text-gold mb-2" />
                    <p className="font-display text-lg font-semibold">{isRu ? "Пауза" : "Paused"}</p>
                  </div>
                </div>
              )}
            </div>

            <PlayerBar name={mode === "ai" ? (isRu ? "Вы" : "You") : (isRu ? "Белые" : "White")} time={whiteTime} active={game.turn() === "w" && !gameOver && !paused} />

            {gameOver && (
              <div className="mt-4 rounded-xl border border-gold/40 bg-gradient-card p-5 text-center shadow-gold">
                <Crown className="mx-auto h-7 w-7 text-gold" />
                <p className="mt-2 font-display text-xl font-semibold">{gameOver}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button onClick={reset} className="rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
                    {isRu ? "Новая игра" : "New game"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-gradient-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{isRu ? "Игра" : "Game"}</h2>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${gameOver ? "border-muted-foreground/40 text-muted-foreground" : "border-gold/40 text-gold"}`}>
                  {gameOver ? (isRu ? "Завершена" : "Finished") : paused ? (isRu ? "Пауза" : "Paused") : turnLabel}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={reset} className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent">
                  <RotateCcw className="h-4 w-4" /> {isRu ? "Новая" : "New"}
                </button>
                <button
                  onClick={() => setPaused((p) => !p)}
                  disabled={!!gameOver}
                  className="flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent disabled:opacity-50"
                >
                  {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {paused ? (isRu ? "Продолжить" : "Resume") : (isRu ? "Пауза" : "Pause")}
                </button>
              </div>
              <div className="mt-2">
                <button onClick={resign} disabled={!!gameOver} className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium transition-smooth hover:bg-accent disabled:opacity-50">
                  <Flag className="h-4 w-4" /> {isRu ? "Сдаться" : "Resign"}
                </button>
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setHintsEnabled((h) => !h)}
                  className={`flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-smooth ${
                    hintsEnabled
                      ? "border-gold/60 bg-gold/10 text-gold"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Brain className="h-4 w-4" />
                  {hintsEnabled ? (isRu ? "Подсказки: вкл" : "Hints: on") : (isRu ? "Подсказки: выкл" : "Hints: off")}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ModeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-smooth ${active ? "border-gold/60 bg-gold/10 text-gold shadow-gold" : "border-border bg-secondary text-muted-foreground hover:text-foreground"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function PlayerBar({ name, time, active }: { name: string; time: number; active: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-smooth ${active ? "border-gold/50 bg-gold/5" : "border-border bg-card/60"}`}>
      <span className="text-sm font-semibold">{name}</span>
      <span className={`flex items-center gap-1.5 font-mono text-base ${active ? "text-gold" : "text-muted-foreground"}`}>
        <Clock className="h-4 w-4" /> {formatTime(time)}
      </span>
    </div>
  );
}