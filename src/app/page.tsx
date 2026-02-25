import PaletteBubblesCanvas from "./components/PaletteBubblesCanvas";
import { COLORS } from "@/data/palette";

export default function Page() {
  return (
    <main className="relative w-screen h-screen bg-white dark:bg-[#0E1116] transition-colors duration-300">
      <PaletteBubblesCanvas colors={COLORS} />

      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-black/40 dark:text-white/35 pointer-events-none transition-colors duration-300">
        © {new Date().getFullYear()} Sakura Wallace. All rights reserved.
      </footer>
    </main>
  );
}
