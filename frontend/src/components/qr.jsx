import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { eventInfo, siteConfig, giftDeskMessage } from "@/lib/site-config";
import { jsx as _jsx } from "react/jsx-runtime";

export function QrSvg({ value, className = "", size = 220 }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: size,
      color: {
        dark: "#1c3f47",
        light: "#00000000",
      },
      errorCorrectionLevel: "M",
    })
      .then((s) => alive && setSvg(s))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (!svg) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-busy="true"
        aria-label="Generating QR code…"
      >
        <div
          className="h-full w-full animate-pulse rounded-xl bg-primary/10"
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return /*#__PURE__*/ _jsx("div", {
    className: className,
    style: {
      width: size,
      height: size,
    },
    role: "img",
    "aria-label": `QR code for ${value}`,
    dangerouslySetInnerHTML: {
      __html: svg,
    },
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [text];
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function sanitizeFilename(name) {
  return String(name)
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) || "entry-pass";
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${filename}.png`;
  a.click();
}

/** Plain QR only — used for simple exports if needed. */
export async function downloadQr(value, filename) {
  const dataUrl = await QRCode.toDataURL(value, {
    width: 720,
    margin: 2,
  });
  triggerDownload(dataUrl, filename);
}

/**
 * Download a full entry pass card: event header, QR, name, entry ID, gift note.
 */
export async function downloadEntryPass({
  signedPayload,
  fullName,
  entryCode,
  filename,
}) {
  const width = 1080;
  const pad = 72;
  const innerWidth = width - pad * 2;
  const qrSize = 480;

  const qrDataUrl = await QRCode.toDataURL(signedPayload, {
    width: qrSize,
    margin: 2,
    color: { dark: "#1c3f47", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  const qrImg = await loadImage(qrDataUrl);

  const measureCanvas = document.createElement("canvas");
  measureCanvas.width = width;
  const mctx = measureCanvas.getContext("2d");
  mctx.font = "bold 52px Georgia, 'Times New Roman', serif";
  const nameLines = wrapText(mctx, fullName, innerWidth - 40);
  const giftNote = giftDeskMessage(fullName);

  const height =
    pad +
    120 +
    60 +
    qrSize +
    48 +
    nameLines.length * 62 +
    80 +
    120 +
    140 +
    pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Background wash
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#fffdf7");
  bg.addColorStop(0.5, "#fff8e7");
  bg.addColorStop(1, "#eef9f8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Gold outer frame
  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 36);
  ctx.strokeStyle = "#D89B24";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner card
  drawRoundedRect(ctx, pad - 12, pad - 12, innerWidth + 24, height - pad * 2 + 24, 28);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,155,36,0.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  let y = pad + 8;

  // Event header
  ctx.textAlign = "center";
  ctx.fillStyle = "#08495B";
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText(siteConfig.brand.name, width / 2, y + 42);
  y += 58;

  ctx.fillStyle = "#D89B24";
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillText("BHAKTA ENTRY PASS", width / 2, y + 22);
  y += 44;

  // QR frame
  const qrX = (width - qrSize - 32) / 2;
  drawRoundedRect(ctx, qrX, y, qrSize + 32, qrSize + 32, 20);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#126B82";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.drawImage(qrImg, qrX + 16, y + 16, qrSize, qrSize);
  y += qrSize + 32 + 36;

  // Name
  ctx.fillStyle = "#17313A";
  ctx.font = "bold 52px Georgia, 'Times New Roman', serif";
  for (const line of nameLines) {
    ctx.fillText(line, width / 2, y);
    y += 62;
  }

  // Entry ID
  y += 8;
  ctx.fillStyle = "#126B82";
  ctx.font = "600 26px system-ui, sans-serif";
  ctx.fillText(`ENTRY PASS · ${entryCode}`, width / 2, y);
  y += 48;

  // Gift note box
  const giftPad = 36;
  const giftBoxH = 120;
  drawRoundedRect(ctx, pad, y, innerWidth, giftBoxH, 18);
  ctx.fillStyle = "rgba(247,217,138,0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,155,36,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#08495B";
  ctx.font = "bold 24px Georgia, 'Times New Roman', serif";
  ctx.fillText("Your Divine Gift", pad + giftPad, y + 38);

  ctx.fillStyle = "#17313A";
  ctx.font = "22px system-ui, sans-serif";
  const giftLines = wrapText(ctx, giftNote, innerWidth - giftPad * 2);
  let gy = y + 72;
  for (const line of giftLines) {
    ctx.fillText(line, pad + giftPad, gy);
    gy += 30;
  }

  y += giftBoxH + 28;

  // Footer
  ctx.textAlign = "center";
  ctx.fillStyle = "#5a6b72";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText(eventInfo.date, width / 2, y);
  y += 30;
  const venueLines = wrapText(ctx, eventInfo.venue, innerWidth);
  ctx.font = "18px system-ui, sans-serif";
  for (const line of venueLines) {
    ctx.fillText(line, width / 2, y);
    y += 26;
  }

  triggerDownload(canvas.toDataURL("image/png"), filename ?? sanitizeFilename(fullName));
}
