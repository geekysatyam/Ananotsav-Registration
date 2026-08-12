import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flourish, PeacockFeather, Lotus } from "./motifs";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "gold",
  compact = false
}) {
  return /*#__PURE__*/_jsxs(motion.div, {
    initial: {
      opacity: 0,
      y: 26
    },
    whileInView: {
      opacity: 1,
      y: 0
    },
    viewport: {
      once: true,
      amount: 0.4
    },
    transition: {
      duration: 0.6
    },
    className: cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left"),
    children: [eyebrow && /*#__PURE__*/_jsx("span", {
      className: cn("inline-block rounded-full font-bold uppercase", compact ? "px-3 py-1 text-[10px] tracking-[0.18em]" : "px-4 py-1.5 text-xs tracking-[0.22em]", tone === "gold" ? "bg-primary/20 text-primary-foreground" : "bg-secondary/15 text-secondary"),
      children: eyebrow
    }), /*#__PURE__*/_jsx("h2", {
      className: cn("font-display text-foreground", compact ? "mt-2 text-2xl sm:mt-4 sm:text-section" : "text-section mt-4"),
      children: title
    }), /*#__PURE__*/_jsx(Flourish, {
      className: cn(compact ? "mt-2 hidden h-5 w-40 sm:mx-auto sm:mt-4 sm:block sm:h-6 sm:w-56" : "mt-4 h-6 w-56", align === "center" && "mx-auto")
    }), subtitle && /*#__PURE__*/_jsx("p", {
      className: cn("text-muted-foreground", compact ? "mt-2 text-sm leading-snug sm:mt-4 sm:text-base sm:leading-relaxed" : "mt-4 text-base leading-relaxed sm:text-lg"),
      children: subtitle
    })]
  });
}
export function FestiveIcon({
  children,
  tone = "gold",
  size = "md",
  className
}) {
  return /*#__PURE__*/_jsx(motion.div, {
    whileHover: {
      scale: 1.08,
      rotate: -4
    },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 14
    },
    className: cn("grid shrink-0 place-items-center rounded-full ring-1", size === "lg" ? "h-24 w-24" : "h-16 w-16", tone === "gold" && "bg-primary/20 text-primary ring-primary/40", tone === "peacock" && "bg-secondary/15 text-secondary ring-secondary/30", tone === "maroon" && "bg-destructive/12 text-destructive ring-destructive/25", className),
    children: children
  });
}
export function FestiveCard({
  children,
  className,
  tone = "gold",
  corner = "feather"
}) {
  return /*#__PURE__*/_jsx("div", {
    className: cn("relative overflow-hidden rounded-3xl p-[2px] shadow-warm", tone === "gold" ? "bg-gradient-gold" : "bg-gradient-peacock"),
    children: /*#__PURE__*/_jsxs("div", {
      className: cn("relative h-full rounded-[calc(1.5rem-1px)] bg-gradient-cream p-6 sm:p-7", className),
      children: [corner !== "none" && /*#__PURE__*/_jsx("div", {
        className: "pointer-events-none absolute -top-4 -right-4 h-24 w-24 opacity-25",
        children: corner === "feather" ? /*#__PURE__*/_jsx(PeacockFeather, {
          className: "h-full w-full"
        }) : /*#__PURE__*/_jsx(Lotus, {
          className: "h-full w-full"
        })
      }), children]
    })
  });
}
export function Reveal({
  children,
  delay = 0,
  className
}) {
  return /*#__PURE__*/_jsx(motion.div, {
    initial: {
      opacity: 0,
      y: 32
    },
    whileInView: {
      opacity: 1,
      y: 0
    },
    viewport: {
      once: true,
      amount: 0.25
    },
    transition: {
      duration: 0.6,
      delay
    },
    className: className,
    children: children
  });
}
export function GoldButton({
  children,
  className,
  glow = false,
  ...props
}) {
  const fullWidth = className?.includes("w-full");
  return /*#__PURE__*/_jsxs("span", {
    className: cn("relative inline-flex", fullWidth && "w-full"),
    children: [glow && /*#__PURE__*/_jsx("span", {
      className: "animate-glow-pulse absolute inset-0 -z-10 rounded-full bg-primary blur-2xl"
    }), /*#__PURE__*/_jsx("button", {
      ...props,
      className: cn("min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-gold px-7 py-3 font-display text-base font-semibold text-primary-foreground shadow-warm ring-1 ring-primary/50 transition-transform duration-200 hover:scale-105 active:scale-95", fullWidth ? "flex w-full" : "inline-flex", className),
      children: children
    })]
  });
}