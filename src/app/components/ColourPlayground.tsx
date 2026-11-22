"use client";

import { ChevronDown, FileDown, Share, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPalettePng, downloadPalettePng } from "./palettePng";

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
  onReset: () => void;
};

const basicColours = ["#FFFFFF", "#FAFAFA", "#ECECEC", "#CFCFCF", "#3D3D3D", "#171717"];

export const areas = ["Card background", "Circle 1", "Circle 2", "Circle 3", "Circle 4", "Circle 5"];

function scrollBehaviour(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export default function ColourPlayground({ open, onToggle, selected, basicColour, onSelectBasic, dragged, fills, onPaint, onReset }: Props) {
  const [canSharePng, setCanSharePng] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [exportError, setExportError] = useState("");

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open && window.innerWidth < 640) {
      sectionRef.current?.scrollIntoView({ block: "end", behavior: scrollBehaviour() });
    }
  }, [open]);

  function togglePlayground() {
    setExportError("");
    if (!open) {
      setCanSharePng(navigator.canShare?.({
        files: [new File([], "palette.png", { type: "image/png" })],
      }) ?? false);
    }
    onToggle();
  }

  async function exportPalette(action: "share" | "download") {
    setExportError("");
    let file: File;
    try {
      file = createPalettePng(fills);
      if (action === "download" || !navigator.canShare?.({ files: [file] })) {
        if (action === "share") setCanSharePng(false);
        downloadPalettePng(file);
        return;
      }
    } catch {
      setExportError("Could not export the PNG. Please try again.");
      return;
    }

    setSharing(true);
    try {
      await navigator.share({ files: [file] });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        setExportError("Sharing is unavailable. Use Save PNG to download the image.");
        setCanSharePng(false);
      }
    } finally {
      setSharing(false);
    }
  }

  const toggleButton = (
    <button
      type="button"
      aria-expanded={open}
      aria-controls="colour-playground"
      className="inline-flex items-center gap-1.5 px-4 py-2 text-lg font-semibold text-foreground sm:aria-expanded:ml-2.5"
      onClick={togglePlayground}
    >
      <ChevronDown size={22} strokeWidth={2.5} aria-hidden="true" className={open ? "rotate-180 sm:rotate-0" : "sm:rotate-180"} />
      Playground
    </button>
  );

  return (
    <aside ref={sectionRef} className="flex flex-col items-end gap-2 px-3 py-4 sm:absolute sm:bottom-5 sm:right-5 sm:p-0">
      <div className="self-center sm:hidden">{toggleButton}</div>
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
              className="relative aspect-square cursor-grab rounded-full border border-current/35 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 active:cursor-grabbing"
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

      {open && exportError && <p role="alert" className="rounded bg-background px-2 py-1 text-sm">{exportError}</p>}
      <div className={`items-center gap-1 sm:flex ${open ? "flex" : "hidden"}`}>
        {open && (
          <>
            <button type="button" onClick={onReset} aria-label="Reset all playground colours to white" title="Reset all playground colours to white" className="grid size-11 place-items-center">
              <Trash2 size={24} aria-hidden="true" />
            </button>
            {canSharePng && (
              <button type="button" disabled={sharing} onClick={() => exportPalette("share")} aria-label="Share palette" title="Share palette" className="grid size-11 place-items-center">
                <Share size={24} aria-hidden="true" />
              </button>
            )}
            <button type="button" onClick={() => exportPalette("download")} aria-label="Save PNG" title="Save PNG" className={`size-11 place-items-center ${canSharePng ? "hidden sm:grid" : "grid"}`}>
              <FileDown size={24} aria-hidden="true" />
            </button>
          </>
        )}
        <div className="hidden sm:block">{toggleButton}</div>
      </div>
    </aside>
  );
}
