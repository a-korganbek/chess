import { Link } from "@tanstack/react-router";
import { Crown, Sun, Moon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/lib/langContext";
import { useTheme } from "@/lib/langContext";
import { t } from "@/lib/i18n";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
            <Crown className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Chess<span className="text-gold">Mind</span>
          </span>
        </Link>

        {/* Десктоп навигация */}
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

        <div className="flex items-center gap-2">
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

          {/* Десктоп кнопки */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground lg:block">{user.email}</span>
                <button
                  onClick={signOut}
                  className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition-smooth hover:bg-accent"
                >
                  {tr.signOut}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium transition-smooth hover:bg-accent">
                  {tr.signIn}
                </Link>
                <Link to="/play" className="rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90">
                  {tr.playNow}
                </Link>
              </>
            )}
          </div>

          {/* Hamburger кнопка */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary transition-smooth hover:bg-accent md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Мобильное меню */}
      {menuOpen && (
        <div className="border-t border-border/60 bg-background/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col px-4 py-4 gap-1">
            <Link
              to="/play"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {tr.play}
            </Link>
            <Link
              to="/leaderboard"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {tr.leaderboard}
            </Link>
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {tr.profile}
            </Link>
            <div className="mt-2 border-t border-border/60 pt-3">
              {user ? (
                <>
                  <p className="px-4 py-1 text-xs text-muted-foreground truncate">{user.email}</p>
                  <button
                    onClick={signOut}
                    className="mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium transition-smooth hover:bg-accent text-left"
                  >
                    {tr.signOut}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium transition-smooth hover:bg-accent text-center"
                  >
                    {tr.signIn}
                  </Link>
                  <Link
                    to="/play"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-gradient-gold px-4 py-3 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90 text-center"
                  >
                    {tr.playNow}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}