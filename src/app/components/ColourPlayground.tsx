"use client";

import { FileDown, Share } from "lucide-react";
import { useState } from "react";

export type ColourDrag = { colour: string; x: number; y: number; area: number | null };

type Props = {
  open: boolean;
  onToggle: () => void;
  selected: string | null;
  basicColour: string | null;
  onSelectBasic: (colour: string) => void;
  dragged: ColourDrag | null;
  fills: string[];
  onPaint: (index: number, colour: string) => void;
};

const basicColours = ["#FFFFFF", "#FAFAFA", "#ECECEC", "#CFCFCF", "#3D3D3D", "#171717"];

export const areas = ["Card background", "Circle 1", "Circle 2", "Circle 3", "Circle 4", "Circle 5"];

export default function ColourPlayground({ open, onToggle, selected, basicColour, onSelectBasic, dragged, fills, onPaint }: Props) {
  const [canSharePng, setCanSharePng] = useState(false);

  function togglePlayground() {
    if (!open) {
      setCanSharePng(navigator.canShare?.({
        files: [new File([], "palette.png", { type: "image/png" })],
      }) ?? false);
    }
    onToggle();
  }

  return (
    <aside className="absolute bottom-3 right-3 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      {open && (
        <div role="group" aria-label="Basic paint colours" className="grid w-full max-w-[19rem] grid-cols-6 gap-2 pt-3 sm:max-w-[21.75rem] sm:gap-3">
          {basicColours.map((colour) => (
            <button
              key={colour}
              type="button"
              data-paint-colour={colour}
              aria-label={`Select paint colour ${colour}`}
              aria-pressed={basicColour === colour}
              title={colour}
              onClick={() => onSelectBasic(colour)}
              style={{ backgroundColor: colour }}
              className="relative aspect-square touch-none cursor-grab rounded-full border border-current/35 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 active:cursor-grabbing"
            >
              {basicColour === colour && (
                <span aria-hidden="true" className="pointer-events-none absolute -top-3 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-current" />
              )}
            </button>
          ))}
        </div>
      )}
      <div
        id="colour-playground"
        hidden={!open}
        role="group"
        aria-label="Colour playground"
        className="relative aspect-[3/1] w-[min(42rem,calc(100vw_-_1.5rem))]"
      >
        {areas.map((area, index) => (
          <button
            key={area}
            data-paint-area={index}
            type="button"
            aria-label={`Paint ${area.toLowerCase()}, currently ${fills[index]}`}
            title={area}
            className={`absolute cursor-crosshair border-2 border-black focus-visible:outline-2 focus-visible:outline-offset-2 ${index === 0
              ? "inset-0 rounded-2xl"
              : "top-1/2 aspect-square w-1/5 -translate-y-1/2 rounded-full"}`}
            style={{
              backgroundColor: dragged?.area === index ? dragged.colour : fills[index],
              left: index === 0 ? undefined : `${6 + (index - 1) * 17}%`,
            }}
            onClick={() => selected && onPaint(index, selected)}
          />
        ))}
      </div>

      {dragged && (
        <span aria-hidden="true" className="pointer-events-none fixed z-10 size-6 rounded-full border border-black shadow-sm"
          style={{ left: dragged.x + 10, top: dragged.y + 10, backgroundColor: dragged.colour }} />
      )}

      <div className="flex items-center gap-1">
        {open && (
          <>
            {canSharePng && (
              <button type="button" disabled aria-label="Share palette" title="Share palette" className="grid size-11 place-items-center">
                <Share size={24} aria-hidden="true" />
              </button>
            )}
            <button type="button" disabled aria-label="Save PNG" title="Save PNG" className={`size-11 place-items-center ${canSharePng ? "hidden sm:grid" : "grid"}`}>
              <FileDown size={24} aria-hidden="true" />
            </button>
          </>
        )}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="colour-playground"
          className="rounded-full border border-black/25 bg-white px-4 py-2 text-sm font-medium text-[#0E1116] shadow-sm aria-expanded:ml-2.5"
          onClick={togglePlayground}
        >
          Playground
        </button>
      </div>
    </aside>
  );
}
