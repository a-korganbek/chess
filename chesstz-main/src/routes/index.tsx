import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Brain, Users, Trophy, Sparkles, Check, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-chess.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLang } from "@/lib/langContext";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ChessMind — Play & Learn Chess" },
      { name: "description", content: "Play chess vs AI or friends. Track your progress and climb the leaderboard." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { lang } = useLang();
  const isRu = lang === "ru";

  const features = [
    { icon: Brain, title: isRu ? "Умный ИИ" : "Smart AI", desc: isRu ? "Три уровня сложности — от новичка до опытного игрока. ИИ адаптируется под тебя." : "Three difficulty levels — from beginner to advanced. The AI adapts to your level." },
    { icon: Users, title: isRu ? "Играй с кем угодно" : "Play Anyone", desc: isRu ? "Против адаптивного ИИ или с другом на одном устройстве." : "Challenge our adaptive AI or pass-and-play with a friend on the same device." },
    { icon: Trophy, title: isRu ? "Расти в рейтинге" : "Climb the Ranks", desc: isRu ? "Глобальная таблица лидеров и реальная статистика побед." : "Global leaderboard and real win statistics to track your progress." },
    { icon: Sparkles, title: isRu ? "Красиво и просто" : "Beautifully Simple", desc: isRu ? "Доска которая приятна на вид. Ничего лишнего. Просто шахматы." : "A board that feels great. Nothing unnecessary. Just chess, the way it should look." },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-hero relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28 lg:py-32">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
              <Sparkles className="h-3 w-3" />
              {isRu ? "Шахматы нового поколения" : "Next generation chess"}
            </div>
            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {isRu ? "Играй в шахматы." : "Play chess."}<br />
              {isRu ? "Становись лучше." : "Actually get better."}
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              {isRu
                ? "ChessMind — современная шахматная платформа с умным ИИ, историей игр и глобальным рейтингом."
                : "ChessMind is a modern chess platform with smart AI, game history, and a global leaderboard."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/play" className="group inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-6 py-3 text-base font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
                {isRu ? "Начать играть" : "Start playing"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/leaderboard" className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-6 py-3 text-base font-medium transition-smooth hover:bg-accent">
                {isRu ? "Рейтинг игроков" : "View leaderboard"}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> {isRu ? "Без регистрации" : "No signup needed"}</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-gold" /> {isRu ? "Бесплатно навсегда" : "Free forever"}</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <img
              src={heroImage}
              alt="Golden chess pieces on a dark board"
              width={1536}
              height={1024}
              className="animate-float relative rounded-2xl shadow-elegant"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-bold md:text-5xl">
            {isRu ? "Всё что нужно шахматисту" : "Everything a chess player wants"}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {isRu ? "Для casual игры и серьёзного прогресса." : "Built for casual play and serious improvement."}
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-gradient-card group rounded-2xl border border-border p-6 transition-smooth hover:border-gold/40 hover:shadow-gold">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold/10 text-gold transition-smooth group-hover:bg-gold group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
        <h2 className="font-display text-4xl font-bold md:text-5xl">
          {isRu ? "Твой следующий ход — здесь." : "Your next move starts here."}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {isRu ? "Начни игру за секунды. Без скачивания и регистрации." : "Jump into a game in seconds. No download, no signup."}
        </p>
        <Link to="/play" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-gold px-8 py-4 text-lg font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
          {isRu ? "Играть в ChessMind" : "Play ChessMind"} <ArrowRight className="h-5 w-5" />
        </Link>
      </section>

      <Footer />
    </div>
  );
}