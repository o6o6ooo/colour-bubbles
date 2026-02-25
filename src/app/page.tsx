import PaletteBubblesCanvas from "./components/PaletteBubblesCanvas";
import { COLORS } from "@/data/palette";

export default function Page() {
  return (
    <main className="relative w-screen h-screen bg-white">
      <PaletteBubblesCanvas colors={COLORS} />

      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs tracking-wide text-black/40 pointer-events-none">
        © {new Date().getFullYear()} Sakura Wallace. All rights reserved.
      </footer>
    </main>
  );
}
