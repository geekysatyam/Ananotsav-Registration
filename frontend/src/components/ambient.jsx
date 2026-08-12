import { memo } from "react";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { PeacockFeather, Diya, Lotus } from "./motifs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Ambient, always-on floating motifs. Independent of scroll. */
export const FloatingMotifs = memo(function FloatingMotifs({
  count = 8
}) {
  const bits = useMemo(() => Array.from({
    length: count
  }).map((_, i) => ({
    left: i * 97 % 100,
    size: 22 + i * 37 % 44,
    delay: i * 1.7 % 12,
    duration: 16 + i * 5 % 14,
    drift: (i % 5 - 2) * 60,
    kind: i % 3,
    opacity: 0.25 + i * 13 % 40 / 100
  })), [count]);
  return /*#__PURE__*/_jsx("div", {
    className: "pointer-events-none absolute inset-0 overflow-hidden",
    "aria-hidden": true,
    children: bits.map((b, i) => /*#__PURE__*/_jsxs(motion.div, {
      layout: false,
      className: "absolute",
      style: {
        left: `${b.left}%`,
        width: b.size,
        height: b.size,
        opacity: b.opacity
      },
      initial: {
        y: "110vh",
        rotate: 0
      },
      animate: {
        y: "-20vh",
        x: [0, b.drift, 0],
        rotate: [0, 180, 340]
      },
      transition: {
        duration: b.duration,
        delay: b.delay,
        repeat: Infinity,
        ease: "linear"
      },
      children: [b.kind === 0 && /*#__PURE__*/_jsx(PeacockFeather, {
        className: "h-full w-full"
      }), b.kind === 1 && /*#__PURE__*/_jsx(Diya, {
        className: "h-full w-full"
      }), b.kind === 2 && /*#__PURE__*/_jsx(Lotus, {
        className: "h-full w-full"
      })]
    }, i))
  });
});

/** Soft moving gradient mesh blobs. */
export function GradientMesh() {
  return /*#__PURE__*/_jsxs("div", {
    className: "pointer-events-none absolute inset-0 overflow-hidden",
    "aria-hidden": true,
    children: [/*#__PURE__*/_jsx(motion.div, {
      className: "absolute -top-40 -left-24 h-[38rem] w-[38rem] rounded-full bg-primary/35 blur-3xl",
      animate: {
        x: [0, 60, 0],
        y: [0, 40, 0],
        scale: [1, 1.1, 1]
      },
      transition: {
        duration: 18,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }), /*#__PURE__*/_jsx(motion.div, {
      className: "absolute -right-32 top-10 h-[34rem] w-[34rem] rounded-full bg-secondary/30 blur-3xl",
      animate: {
        x: [0, -70, 0],
        y: [0, 60, 0],
        scale: [1.1, 1, 1.1]
      },
      transition: {
        duration: 22,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }), /*#__PURE__*/_jsx(motion.div, {
      className: "absolute bottom-[-14rem] left-1/3 h-[30rem] w-[30rem] rounded-full bg-destructive/15 blur-3xl",
      animate: {
        x: [0, 40, 0],
        y: [0, -40, 0]
      },
      transition: {
        duration: 26,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })]
  });
}