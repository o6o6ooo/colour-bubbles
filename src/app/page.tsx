import PaletteBubblesCanvas from "./components/PaletteBubblesCanvas";
import { COLORS } from "@/data/palette";

export default function Page() {
  return (
    <main className="w-screen h-screen bg-white">
      <PaletteBubblesCanvas colors={COLORS} />
    </main>
  );
}
