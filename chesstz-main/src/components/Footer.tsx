export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row">
        <p>© {new Date().getFullYear()} ChessMind. Sharpen your mind.</p>
        <p className="text-xs">Built for players who want to actually get better.</p>
      </div>
    </footer>
  );
}
