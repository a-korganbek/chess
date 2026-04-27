import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Lang } from "./i18n";

type Theme = "dark" | "light";

type AppContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const AppContext = createContext<AppContextType>({
  lang: "ru",
  setLang: () => {},
  theme: "dark",
  setTheme: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Применяем тему к html элементу
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
  }, [theme]);

  function handleSetLang(l: Lang) {
    setLang(l);
  }

  function handleSetTheme(t: Theme) {
    setTheme(t);
  }

  return (
    <AppContext.Provider value={{ lang, setLang: handleSetLang, theme, setTheme: handleSetTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useLang() {
  const { lang, setLang } = useContext(AppContext);
  return { lang, setLang };
}

export function useTheme() {
  const { theme, setTheme } = useContext(AppContext);
  return { theme, setTheme };
}