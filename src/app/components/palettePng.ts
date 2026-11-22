// Render at twice the layout size so the outlines and HEX labels stay crisp.
export function createPalettePng(fills: readonly string[]): File {
  const width = 744;
  const height = 294;
  const canvas = document.createElement("canvas");
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");

  ctx.scale(2, 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(1, 1, width - 2, height - 2, 28);
  ctx.fillStyle = fills[0];
  ctx.fill();
  ctx.stroke();

  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = parseInt(fills[0].slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const textColour = luminance > 0.179 ? "#000000" : "#FFFFFF";
  ctx.fillStyle = textColour;
  ctx.font = "600 17px system-ui, sans-serif";
  ctx.letterSpacing = "0.5px";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelInset = 40;
  ctx.fillText(fills[0].slice(1).toUpperCase(), width / 2, labelInset);

  fills.slice(1).forEach((colour, index) => {
    const centreX = width * (0.16 + index * 0.17);
    ctx.beginPath();
    ctx.arc(centreX, height / 2, width * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = textColour;
    ctx.fillText(colour.slice(1).toUpperCase(), centreX, height - labelInset);
  });

  // Keep the share call in the original click gesture, including on Safari.
  const dataUrl = canvas.toDataURL("image/png");
  const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), (char) => char.charCodeAt(0));
  return new File([bytes], "colour-bubbles.png", { type: "image/png" });
}

let lastDownloadStamp = "";
let downloadCount = 0;

function downloadFilename(now: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const stamp = `${date}_${time}`;
  downloadCount = stamp === lastDownloadStamp ? downloadCount + 1 : 1;
  lastDownloadStamp = stamp;
  const suffix = downloadCount > 1 ? `_${downloadCount}` : "";
  return `colour-bubbles_${stamp}${suffix}.png`;
}

export function downloadPalettePng(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = downloadFilename(new Date());
  document.body.append(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Give the browser time to start reading the file.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
