/** Responsive scan box — avoids white corner artifacts on small screens */
export function qrScanBox(viewfinderWidth, viewfinderHeight) {
  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
  const margin = 24;
  const maxSize = minEdge - margin * 2;
  const size = Math.max(140, Math.min(Math.floor(minEdge * 0.72), maxSize));
  return { width: size, height: size };
}

export const SCANNER_CAMERA_CONFIG = {
  fps: 10,
  qrbox: qrScanBox,
};

export const QR_READER_CLASS =
  "qr-scanner-view relative mt-4 min-h-[240px] w-full overflow-hidden rounded-3xl bg-foreground/90 ring-4 ring-primary/40 [&>video]:!h-full [&>video]:!w-full [&>video]:!object-cover";
