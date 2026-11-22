"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onToggle: () => void;
  selected: string | null;
  dragged: string | null;
};

const areas = ["Card background", "Circle 1", "Circle 2", "Circle 3", "Circle 4", "Circle 5"];

export default function ColourPlayground({ open, onToggle, selected, dragged }: Props) {
  const [fills, setFills] = useState(() => areas.map(() => "#FFFFFF"));
  const [preview, setPreview] = useState<number | null>(null);

  function paint(index: number, colour: string) {
    setFills((current) => current.map((fill, i) => i === index ? colour : fill));
  }

  return (
    <aside className="absolute bottom-3 right-3 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      <div
        id="colour-playground"
        hidden={!open}
        role="group"
        aria-label="Colour playground"
        className="relative aspect-[3/1] w-[min(21rem,calc(100vw_-_1.5rem))]"
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPreview(null);
        }}
      >
        {areas.map((area, index) => (
          <button
            key={area}
            type="button"
            aria-label={`Paint ${area.toLowerCase()}, currently ${fills[index]}`}
            title={area}
            className={`absolute cursor-crosshair border-2 border-black focus-visible:outline-2 focus-visible:outline-offset-2 ${index === 0
              ? "inset-0 rounded-2xl"
              : "top-1/2 aspect-square w-1/5 -translate-y-1/2 rounded-full"}`}
            style={{
              backgroundColor: dragged && preview === index ? dragged : fills[index],
              left: index === 0 ? undefined : `${6 + (index - 1) * 17}%`,
            }}
            onClick={() => selected && paint(index, selected)}
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes("application/x-colour-bubble")) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setPreview(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              const colour = event.dataTransfer.getData("application/x-colour-bubble");
              if (dragged && colour === dragged) paint(index, colour);
              setPreview(null);
            }}
          />
        ))}
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="colour-playground"
        className="rounded-full border border-black/25 bg-white px-4 py-2 text-sm font-medium text-[#0E1116] shadow-sm"
        onClick={() => {
          setPreview(null);
          onToggle();
        }}
      >
        Playground
      </button>
    </aside>
  );
}
