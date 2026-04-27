import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Crown, Eye, EyeOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/langContext";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === "ru";
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function validate(): string | null {
    if (!email.trim()) return isRu ? "Введите email" : "Enter your email";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return isRu ? "Некорректный email" : "Invalid email address";
    if (!password) return isRu ? "Введите пароль" : "Enter your password";
    if (password.length < 6) return isRu ? "Пароль минимум 6 символов" : "Password must be at least 6 characters";
    return null;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login")) {
          setError(isRu ? "Неверный email или пароль" : "Invalid email or password");
        } else {
          setError(isRu ? "Ошибка входа. Попробуйте снова." : "Login error. Please try again.");
        }
      } else {
        router.navigate({ to: "/play" });
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          setError(isRu ? "Этот email уже зарегистрирован" : "This email is already registered");
        } else {
          setError(isRu ? "Ошибка регистрации. Попробуйте снова." : "Registration error. Please try again.");
        }
      } else {
        setIsLogin(true);
        setSuccess(isRu ? "Аккаунт создан! Войдите." : "Account created! Sign in.");
      }
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold shadow-gold">
              <Crown className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold">
              Chess<span className="text-gold">Mind</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-gradient-card p-8 shadow-elegant">
          <h1 className="font-display text-2xl font-bold text-center">
            {isLogin ? (isRu ? "Войти" : "Sign in") : (isRu ? "Создать аккаунт" : "Create account")}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {isLogin ? (isRu ? "Нет аккаунта?" : "No account?") : (isRu ? "Уже есть аккаунт?" : "Already have an account?")}{" "}
            <button onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }} className="text-gold hover:underline">
              {isLogin ? (isRu ? "Зарегистрироваться" : "Sign up") : (isRu ? "Войти" : "Sign in")}
            </button>
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">{isRu ? "Пароль" : "Password"}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••"
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
              {!isLogin && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {isRu ? "Минимум 6 символов" : "Minimum 6 characters"}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-400">{success}</p>}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-2 rounded-lg bg-gradient-gold py-2.5 text-sm font-semibold text-primary-foreground shadow-gold transition-smooth hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (isRu ? "Загрузка..." : "Loading...") : isLogin ? (isRu ? "Войти" : "Sign in") : (isRu ? "Зарегистрироваться" : "Sign up")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}