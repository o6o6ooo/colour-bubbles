"use client";

export type ColourDrag = { colour: string; x: number; y: number; area: number | null };

type Props = {
  open: boolean;
  onToggle: () => void;
  selected: string | null;
  dragged: ColourDrag | null;
  fills: string[];
  onPaint: (index: number, colour: string) => void;
};

export const areas = ["Card background", "Circle 1", "Circle 2", "Circle 3", "Circle 4", "Circle 5"];

export default function ColourPlayground({ open, onToggle, selected, dragged, fills, onPaint }: Props) {
  return (
    <aside className="absolute bottom-3 right-3 flex flex-col items-end gap-2 sm:bottom-5 sm:right-5">
      <div
        id="colour-playground"
        hidden={!open}
        role="group"
        aria-label="Colour playground"
        className="relative aspect-[3/1] w-[min(21rem,calc(100vw_-_1.5rem))]"
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

      <button
        type="button"
        aria-expanded={open}
        aria-controls="colour-playground"
        className="rounded-full border border-black/25 bg-white px-4 py-2 text-sm font-medium text-[#0E1116] shadow-sm"
        onClick={onToggle}
      >
        Playground
      </button>
    </aside>
  );
}
