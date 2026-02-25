// app/page.tsx
import PaletteBubblesCanvas from "./components/PaletteBubblesCanvas";
import { COLORS } from "@/data/palette";

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          My colour palette
        </h1>
        <p className="mt-2 text-sm text-black/55">
          A canvas of bubbles. Hover, nudge, click to copy a hex code.
        </p>
      </header>

      <PaletteBubblesCanvas colors={COLORS} />

      <footer className="mt-8 text-xs text-black/40">
        Built with Next.js + Canvas. No images used.
      </footer>
    </main>
  );
}
