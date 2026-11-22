"use client";

import { useCallback, useState } from "react";
import PaletteBubblesCanvas from "./components/PaletteBubblesCanvas";
import ColourPlayground, { areas, type ColourDrag } from "./components/ColourPlayground";
import { COLORS } from "@/data/palette";

const backgroundColours = ["#FFFFFF", "#F6F6F6", "#F5F5F5", "#F2F2F2", "#0E1116"];

export default function Page() {
  const [background, setBackground] = useState(backgroundColours[0]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragged, setDragged] = useState<ColourDrag | null>(null);
  const [fills, setFills] = useState(() => areas.map(() => "#FFFFFF"));
  const paint = useCallback((index: number, colour: string) => {
    setFills((current) => current.map((fill, i) => i === index ? colour : fill));
  }, []);

  return (
    <main
      data-theme={background === "#0E1116" ? "dark" : "light"}
      style={{ backgroundColor: background }}
      className="relative w-screen h-screen text-foreground transition-colors duration-300"
    >
      <PaletteBubblesCanvas colors={COLORS} playgroundOpen={open} onSelect={setSelected} onDragColour={setDragged} onPaint={paint} />

      <fieldset className="absolute left-3 top-2 flex flex-row sm:flex-col">
        <legend className="sr-only">Background colour</legend>
        {backgroundColours.map((colour) => (
          <label key={colour} title={colour} className="flex h-12 w-14 cursor-pointer flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
            <input
              type="radio"
              name="background-colour"
              value={colour}
              aria-label={colour}
              checked={background === colour}
              onChange={() => setBackground(colour)}
              className="peer sr-only"
            />
            <span
              style={{ backgroundColor: colour }}
              className="size-9 rounded-full border border-current/35 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
            />
            {background === colour && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
          </label>
        ))}
      </fieldset>

      <ColourPlayground open={open} onToggle={() => setOpen(!open)} selected={selected} dragged={dragged} fills={fills} onPaint={paint} />

      <footer className="pointer-events-none absolute bottom-4 left-3 right-32 text-xs opacity-40 transition-colors duration-300 sm:bottom-6 sm:inset-x-0 sm:text-center">
        © {new Date().getFullYear()} Sakura Wallace. All rights reserved.
      </footer>
    </main>
  );
}
