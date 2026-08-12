import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Cake, Search, Loader2 } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { GoldButton, SectionHeading } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, Lotus, PatternBackdrop, PeacockFan, TempleSilhouette } from "@/components/motifs";
import { api, normalizePhone, saveRegistrationResult } from "@/lib/api";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [{
      title: "Find My Registration — Janmashtami Utsav 2026"
    }, {
      name: "description",
      content: "Lost your entry QR? Look up your Janmashtami Utsav registration with your phone number and date of birth."
    }, {
      property: "og:title",
      content: "Find My Registration — Janmashtami Utsav 2026"
    }, {
      property: "og:description",
      content: "Retrieve your entry QR codes and keychain pass in seconds."
    }]
  }),
  component: FindPage
});
function FindPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [noMatch, setNoMatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  return /*#__PURE__*/_jsx(SiteShell, {
    children: /*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden bg-gradient-festive py-20",
      children: [/*#__PURE__*/_jsx(GradientMesh, {}), /*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "mandala",
        className: "text-secondary opacity-[0.07]"
      }), /*#__PURE__*/_jsx(FloatingMotifs, {
        count: 8
      }), /*#__PURE__*/_jsx(TempleSilhouette, {
        className: "pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-secondary/15"
      }), /*#__PURE__*/_jsx(Lotus, {
        className: "pointer-events-none absolute -left-10 top-32 h-52 w-52 opacity-25"
      }), /*#__PURE__*/_jsxs("div", {
        className: "relative mx-auto max-w-2xl px-4 sm:px-6",
        children: [/*#__PURE__*/_jsx(SectionHeading, {
          eyebrow: "Already registered?",
          title: "Find my registration",
          subtitle: "Enter the phone number and date of birth you registered with \u2014 we'll bring back your entry QR codes."
        }), /*#__PURE__*/_jsx(motion.form, {
          initial: {
            opacity: 0,
            y: 26
          },
          animate: {
            opacity: 1,
            y: 0
          },
          onSubmit: async e => {
            e.preventDefault();
            setNoMatch(false);
            setError(null);
            setLoading(true);
            try {
              const match = await api.findRegistration(normalizePhone(phone), dob);
              if (!match) {
                setNoMatch(true);
                return;
              }
              // Normalise to the shape loadRegistrationResult() expects:
              // { registrations: [...], familyGroupId: string|null }
              const result = Array.isArray(match.registrations)
                ? match
                : { registrations: [match], familyGroupId: match.familyGroupId ?? null };
              if (!result.registrations.length) {
                setNoMatch(true);
                return;
              }
              saveRegistrationResult(result);
              navigate({ to: "/success" });
            } catch {
              setError("Lookup failed. Please try again.");
            } finally {
              setLoading(false);
            }
          },
          className: "mt-10 rounded-[2rem] bg-gradient-gold p-[3px] shadow-warm",
          children: /*#__PURE__*/_jsxs("div", {
            className: "relative overflow-hidden rounded-[calc(2rem-2px)] bg-card p-6 sm:p-8",
            children: [/*#__PURE__*/_jsx(PatternBackdrop, {
              variant: "feather",
              className: "text-primary opacity-[0.06]"
            }), /*#__PURE__*/_jsxs("div", {
              className: "relative space-y-5",
              children: [/*#__PURE__*/_jsxs("label", {
                className: "block",
                children: [/*#__PURE__*/_jsxs("span", {
                  className: "mb-2 flex items-center gap-2 text-sm font-bold text-secondary",
                  children: [/*#__PURE__*/_jsx(Phone, {
                    className: "h-5 w-5"
                  }), " Phone Number"]
                }), /*#__PURE__*/_jsx("input", {
                  required: true,
                  type: "tel",
                  value: phone,
                  onChange: e => {
                    setPhone(e.target.value);
                    setNoMatch(false);
                    setError(null);
                  },
                  placeholder: "9876543210",
                  className: "min-h-12 w-full rounded-2xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                })]
              }), /*#__PURE__*/_jsxs("label", {
                className: "block",
                children: [/*#__PURE__*/_jsxs("span", {
                  className: "mb-2 flex items-center gap-2 text-sm font-bold text-secondary",
                  children: [/*#__PURE__*/_jsx(Cake, {
                    className: "h-5 w-5"
                  }), " Date of Birth"]
                }), /*#__PURE__*/_jsx("input", {
                  required: true,
                  type: "date",
                  value: dob,
                  onChange: e => {
                    setDob(e.target.value);
                    setNoMatch(false);
                    setError(null);
                  },
                  className: "min-h-12 w-full rounded-2xl border-2 border-primary/30 bg-background px-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/20"
                })]
              }), error && /*#__PURE__*/_jsx("p", {
                className: "text-sm font-semibold text-destructive",
                children: error
              }), /*#__PURE__*/_jsxs("div", {
                className: "pt-2 text-center",
                children: [/*#__PURE__*/_jsx(GoldButton, {
                  glow: true,
                  type: "submit",
                  disabled: loading,
                  className: "w-full justify-center py-4 text-lg",
                  children: loading ? /*#__PURE__*/_jsxs(_Fragment, {
                    children: [/*#__PURE__*/_jsx(Loader2, {
                      className: "h-5 w-5 animate-spin"
                    }), " Searching\u2026"]
                  }) : /*#__PURE__*/_jsxs(_Fragment, {
                    children: [/*#__PURE__*/_jsx(Search, {
                      className: "h-5 w-5"
                    }), " Find My Registration"]
                  })
                }), /*#__PURE__*/_jsx(Flourish, {
                  className: "mx-auto mt-5 h-5 w-44"
                })]
              })]
            })]
          })
        }), noMatch && /*#__PURE__*/_jsx(motion.div, {
          initial: {
            opacity: 0,
            y: 20
          },
          animate: {
            opacity: 1,
            y: 0
          },
          className: "mt-8 rounded-[2rem] bg-gradient-peacock p-[3px] shadow-warm",
          children: /*#__PURE__*/_jsxs("div", {
            className: "relative overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-cream p-8 text-center",
            children: [/*#__PURE__*/_jsx(PatternBackdrop, {
              variant: "diya",
              className: "text-secondary opacity-[0.07]"
            }), /*#__PURE__*/_jsx(PeacockFan, {
              className: "relative mx-auto h-40 w-40 opacity-70"
            }), /*#__PURE__*/_jsx("h3", {
              className: "relative mt-2 font-display text-2xl",
              children: "No registration found under that number"
            }), /*#__PURE__*/_jsx("p", {
              className: "relative mx-auto mt-2 max-w-md text-muted-foreground",
              children: "Perhaps a family member registered on your behalf, or the details differ slightly. You can always register afresh \u2014 it takes under a minute."
            }), /*#__PURE__*/_jsx(Link, {
              to: "/register",
              className: "relative mt-6 inline-block",
              children: /*#__PURE__*/_jsx(GoldButton, {
                children: "Register for Free !!"
              })
            })]
          })
        })]
      })]
    })
  });
}