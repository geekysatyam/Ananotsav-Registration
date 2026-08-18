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

function paintPassChrome(ctx, width, height, pad) {
  const innerWidth = width - pad * 2;
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, "#fffdf7");
  bg.addColorStop(0.5, "#fff8e7");
  bg.addColorStop(1, "#eef9f8");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 36);
  ctx.strokeStyle = "#D89B24";
  ctx.lineWidth = 6;
  ctx.stroke();

  drawRoundedRect(ctx, pad - 12, pad - 12, innerWidth + 24, height - pad * 2 + 24, 28);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,155,36,0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function paintQrFrame(ctx, img, x, y, qrSize) {
  const frame = 28;
  drawRoundedRect(ctx, x, y, qrSize + frame, qrSize + frame, 20);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#126B82";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.drawImage(img, x + frame / 2, y + frame / 2, qrSize, qrSize);
}

function paintNoteBox(ctx, x, y, w, h, title, lines) {
  const inset = 32;
  drawRoundedRect(ctx, x, y, w, h, 18);
  ctx.fillStyle = "rgba(247,217,138,0.35)";
  ctx.fill();
  ctx.strokeStyle = "rgba(216,155,36,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#08495B";
  ctx.font = "bold 24px Georgia, 'Times New Roman', serif";
  ctx.fillText(title, x + inset, y + 40);

  ctx.fillStyle = "#4a5560";
  ctx.font = "22px system-ui, sans-serif";
  let ty = y + 72;
  for (const line of lines) {
    ctx.fillText(line, x + inset, ty);
    ty += 28;
  }
}

function paintPassFooter(ctx, width, y) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b7a80";
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillText(eventInfo.date, width / 2, y);
  ctx.font = "18px system-ui, sans-serif";
  ctx.fillText(eventInfo.venue, width / 2, y + 28);
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
  const pad = 64;
  const innerWidth = width - pad * 2;
  const qrSize = 460;
  const qrFrame = 28;

  const qrDataUrl = await QRCode.toDataURL(signedPayload, {
    width: qrSize,
    margin: 2,
    color: { dark: "#1c3f47", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  const qrImg = await loadImage(qrDataUrl);

  const measure = document.createElement("canvas").getContext("2d");
  measure.font = "bold 48px Georgia, 'Times New Roman', serif";
  const nameLines = wrapText(measure, fullName, innerWidth - 24);
  measure.font = "22px system-ui, sans-serif";
  const giftLines = wrapText(measure, giftDeskMessage(fullName), innerWidth - 64);

  const giftBoxH = 36 + 28 + giftLines.length * 28 + 28;
  const nameFontSize = 48;
  const clearBelowQr = 36;
  const nameAscent = Math.ceil(nameFontSize * 0.85);
  const height =
    pad +
    86 +
    28 +
    (qrSize + qrFrame) +
    clearBelowQr +
    nameAscent +
    nameLines.length * (nameFontSize + 10) +
    44 +
    28 +
    giftBoxH +
    36 +
    52 +
    pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  paintPassChrome(ctx, width, height, pad);

  let y = pad + 4;
  ctx.textAlign = "center";
  ctx.fillStyle = "#08495B";
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText(siteConfig.brand.name, width / 2, y + 42);
  y += 54;

  ctx.fillStyle = "#D89B24";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillText("BHAKTA ENTRY PASS", width / 2, y + 22);
  y += 50;

  const qrX = (width - qrSize - qrFrame) / 2;
  paintQrFrame(ctx, qrImg, qrX, y, qrSize);
  // fillText y is the baseline — leave clear space under the QR frame first
  y += qrSize + qrFrame + clearBelowQr + nameAscent;

  ctx.fillStyle = "#17313A";
  ctx.font = `bold ${nameFontSize}px Georgia, 'Times New Roman', serif`;
  for (const line of nameLines) {
    ctx.fillText(line, width / 2, y);
    y += nameFontSize + 10;
  }

  y += 16;
  ctx.fillStyle = "#126B82";
  ctx.font = "600 24px system-ui, sans-serif";
  ctx.fillText(`ENTRY PASS · ${entryCode}`, width / 2, y);
  y += 44;

  paintNoteBox(ctx, pad, y, innerWidth, giftBoxH, "A divine evening awaits", giftLines);
  y += giftBoxH + 36;
  paintPassFooter(ctx, width, y);

  triggerDownload(canvas.toDataURL("image/png"), filename ?? sanitizeFilename(fullName));
}

/**
 * Download a referral QR card in the same pass style — header, QR, code, note.
 * REFERRAL DISABLED — function body not used while referral is off.
 */
export async function downloadReferralPass({
  referralLink,
  referralCode,
  filename,
}) {
  // REFERRAL DISABLED
  return;
  /*
  const width = 1080;
  ... original canvas pass lives in git; restore by uncommenting the previous implementation.
  */
  void referralLink;
  void referralCode;
  void filename;
}

/* REFERRAL DISABLED — original downloadReferralPass body
  const width = 1080;
  const pad = 64;
  const innerWidth = width - pad * 2;
  const qrSize = 460;
  const qrFrame = 28;

  const qrDataUrl = await QRCode.toDataURL(referralLink, {
    width: qrSize,
    margin: 2,
    color: { dark: "#1c3f47", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  const qrImg = await loadImage(qrDataUrl);

  const measure = document.createElement("canvas").getContext("2d");
  measure.font = "22px system-ui, sans-serif";
  const noteLines = wrapText(
    measure,
    "Every bhakta who registers with your Krishna code lifts you up the live leaderboard.",
    innerWidth - 64,
  );
  const noteBoxH = 36 + 28 + noteLines.length * 28 + 28;
  const codeFontSize = 48;
  const clearBelowQr = 36;
  const codeAscent = Math.ceil(codeFontSize * 0.85);
  const height =
    pad +
    86 +
    28 +
    (qrSize + qrFrame) +
    clearBelowQr +
    codeAscent +
    (codeFontSize + 10) +
    44 +
    28 +
    noteBoxH +
    36 +
    52 +
    pad;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  paintPassChrome(ctx, width, height, pad);

  let y = pad + 4;
  ctx.textAlign = "center";
  ctx.fillStyle = "#08495B";
  ctx.font = "bold 42px Georgia, 'Times New Roman', serif";
  ctx.fillText(siteConfig.brand.name, width / 2, y + 42);
  y += 54;

  ctx.fillStyle = "#D89B24";
  ctx.font = "bold 20px system-ui, sans-serif";
  ctx.fillText("KRISHNA REFERRAL CODE", width / 2, y + 22);
  y += 50;

  const qrX = (width - qrSize - qrFrame) / 2;
  paintQrFrame(ctx, qrImg, qrX, y, qrSize);
  y += qrSize + qrFrame + clearBelowQr + codeAscent;

  ctx.fillStyle = "#08495B";
  ctx.font = `bold ${codeFontSize}px Georgia, 'Times New Roman', serif`;
  ctx.fillText(referralCode, width / 2, y);
  y += codeFontSize + 18;

  ctx.fillStyle = "#126B82";
  ctx.font = "600 22px system-ui, sans-serif";
  ctx.fillText("Scan to register with this code", width / 2, y);
  y += 40;

  paintNoteBox(ctx, pad, y, innerWidth, noteBoxH, "Share & rise on the leaderboard", noteLines);
  y += noteBoxH + 36;
  paintPassFooter(ctx, width, y);

  triggerDownload(
    canvas.toDataURL("image/png"),
    filename ?? `referral-${sanitizeFilename(referralCode)}`,
  );
}
*/
