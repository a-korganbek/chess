import { Link } from "@tanstack/react-router";
import { Crown, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";
import { useTheme } from "@/lib/langContext";
import { t } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const tr = t[lang];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Chess<span className="text-gold">Mind</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/play" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {tr.play}
          </Link>
          <Link to="/leaderboard" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {tr.leaderboard}
          </Link>
          <Link to="/profile" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground" activeProps={{ className: "text-foreground" }}>
            {tr.profile}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Переключатель языка */}
          <div className="flex rounded-lg border border-border bg-secondary p-0.5">
            <button
              onClick={() => setLang("ru")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-smooth ${lang === "ru" ? "bg-gradient-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              RU
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-smooth ${lang === "en" ? "bg-gradient-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"}`}
            >
              EN
            </button>
          </div>

          {/* Переключатель темы */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary transition-smooth hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-gold" /> : <Moon className="h-4 w-4 text-gold" />}
          </button>

          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:block">{user.email}</span>
              <button
                onClick={signOut}
                className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition-smooth hover:bg-accent"
              >
                {tr.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition-smooth hover:bg-accent sm:inline-flex"
              >
                {tr.signIn}
              </Link>
              <Link
                to="/play"
                className="rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90"
              >
                {tr.playNow}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}