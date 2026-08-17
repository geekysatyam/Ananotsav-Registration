import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, MessageCircle, Instagram, Send, PartyPopper, CalendarDays } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { GoldButton, Reveal, SectionHeading, FestiveIcon } from "@/components/festive";
import { FloatingMotifs, GradientMesh } from "@/components/ambient";
import { Flourish, Gift, PatternBackdrop, PeacockFeather, Lotus } from "@/components/motifs";
import { QrSvg, downloadEntryPass } from "@/components/qr";
import { eventInfo, REFERRAL_LINK_BASE, getGoogleCalendarEventUrl } from "@/lib/event-info";
import { loadRegistrationResult } from "@/lib/api";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [{
      title: "Registration Confirmed — Janmashtami Utsav 2026"
    }, {
      name: "description",
      content: "Your Janmashtami Utsav entry QR codes are ready. Download them, share your referral code and claim Divine Gifts at the desk."
    }, {
      property: "og:title",
      content: "Registration Confirmed — Janmashtami Utsav 2026"
    }, {
      property: "og:description",
      content: "Entry QR codes for every family member, plus your Divine Gift pass."
    }]
  }),
  component: SuccessPage
});
function Confetti() {
  const bits = Array.from({
    length: 20
  }).map((_, i) => ({
    x: i * 53 % 100,
    delay: i % 10 * 0.06,
    hue: i % 3
  }));
  return /*#__PURE__*/_jsx("div", {
    className: "pointer-events-none absolute inset-0 overflow-hidden",
    "aria-hidden": true,
    children: bits.map((b, i) => /*#__PURE__*/_jsx(motion.span, {
      className: `absolute top-0 h-3 w-1.5 rounded-full ${b.hue === 0 ? "bg-primary" : b.hue === 1 ? "bg-secondary" : "bg-destructive"}`,
      style: {
        left: `${b.x}%`
      },
      initial: {
        y: -40,
        opacity: 1,
        rotate: 0
      },
      animate: {
        y: "100vh",
        opacity: [1, 1, 0],
        rotate: 720
      },
      transition: {
        duration: 2.6 + i % 5 * 0.4,
        delay: b.delay,
        ease: "easeIn"
      }
    }, i))
  });
}
function displayFirstName(name) {
  const part = name.trim().split(/\s+/)[0] || name;
  return part.length > 14 ? `${part.slice(0, 14)}…` : part;
}
function GiftCard({
  name
}) {
  const first = displayFirstName(name);
  return /*#__PURE__*/_jsx("div", {
    className: "mt-2 rounded-xl bg-gradient-gold p-[2px] sm:mt-3",
    children: /*#__PURE__*/_jsxs("div", {
      className: "flex items-start gap-2.5 rounded-[calc(0.75rem-1px)] bg-card p-2.5 sm:items-center sm:gap-3 sm:p-3",
      children: [/*#__PURE__*/_jsx(Gift, {
        className: "h-10 w-10 shrink-0 sm:h-12 sm:w-12"
      }), /*#__PURE__*/_jsxs("div", {
        className: "min-w-0 flex-1",
        children: [/*#__PURE__*/_jsx("div", {
          className: "font-display text-sm sm:text-base",
          children: "Your Divine Gift"
        }), /*#__PURE__*/_jsxs("p", {
          className: "text-xs leading-snug text-muted-foreground",
          children: ["Show at the Registration Desk for ", /*#__PURE__*/_jsx("span", {
            className: "break-all font-semibold text-foreground",
            title: name,
            children: first
          }), "'s Divine Gift."]
        })]
      })]
    })
  });
}
function DownloadActions({
  member,
  registrations,
  downloaded,
  onDownload,
  onDownloadAll
}) {
  const btn = "flex min-h-10 w-full items-center justify-center gap-2 rounded-full px-3 py-2 font-display text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-4";
  return /*#__PURE__*/_jsxs("div", {
    className: "relative mt-2 w-full sm:mt-3",
    children: [/*#__PURE__*/_jsx("div", {
      className: `grid w-full gap-2 ${registrations.length > 1 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`,
      children: [/*#__PURE__*/_jsxs("button", {
        type: "button",
        onClick: () => onDownload(member),
        className: `${btn} bg-gradient-gold text-primary-foreground shadow-warm ring-1 ring-primary/50`,
        children: [/*#__PURE__*/_jsx(Download, {
          className: "h-4 w-4 shrink-0 sm:h-5 sm:w-5"
        }), /*#__PURE__*/_jsx("span", {
          children: "Download Pass"
        })]
      }), registrations.length > 1 && /*#__PURE__*/_jsxs("button", {
        type: "button",
        onClick: onDownloadAll,
        className: `${btn} bg-secondary/15 text-secondary ring-1 ring-secondary/35`,
        children: [/*#__PURE__*/_jsx(Download, {
          className: "h-4 w-4 shrink-0 sm:h-5 sm:w-5"
        }), /*#__PURE__*/_jsx("span", {
          children: "Download All"
        })]
      })]
    }), /*#__PURE__*/_jsxs("p", {
      className: "mt-1.5 text-center text-xs text-muted-foreground",
      children: [downloaded.length, " of ", registrations.length, " downloaded"]
    })]
  });
}
function SuccessPage() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [familyGroupId, setFamilyGroupId] = useState(null);
  const [index, setIndex] = useState(0);
  const [downloaded, setDownloaded] = useState([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const result = loadRegistrationResult();
    if (!result || result.registrations.length === 0) {
      navigate({ to: "/register" });
      return;
    }
    setRegistrations(result.registrations);
    setFamilyGroupId(result.familyGroupId);
    setReady(true);
  }, [navigate]);
  if (!ready) return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-festive">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
  const safeIndex = Math.min(index, registrations.length - 1);
  const member = registrations[safeIndex];
  const primary = registrations.find(r => r.isPrimaryRegistrant) ?? registrations[0];
  const confirmationLabel = familyGroupId ?? primary.entryCode;
  const markDownload = async (reg) => {
    await downloadEntryPass({
      signedPayload: reg.signedPayload,
      fullName: reg.fullName,
      entryCode: reg.entryCode,
      filename: `entry-pass-${reg.entryCode}`,
    });
    setDownloaded((d) => (d.includes(reg.id) ? d : [...d, reg.id]));
  };
  const referralLink = primary.referralCode ? `${REFERRAL_LINK_BASE}?ref=${encodeURIComponent(primary.referralCode)}` : null;
  const googleCalendarUrl = getGoogleCalendarEventUrl(registrations);
  return /*#__PURE__*/_jsx(SiteShell, {
    children: /*#__PURE__*/_jsxs("section", {
      className: "relative overflow-hidden bg-gradient-festive py-5 sm:py-16",
      children: [/*#__PURE__*/_jsx(GradientMesh, {}), /*#__PURE__*/_jsx(PatternBackdrop, {
        variant: "mandala",
        className: "text-secondary opacity-[0.07]"
      }), /*#__PURE__*/_jsx(FloatingMotifs, {
        count: 10
      }), /*#__PURE__*/_jsx(Confetti, {}), /*#__PURE__*/_jsxs("div", {
        className: "relative mx-auto max-w-4xl px-4 sm:px-6",
        children: [/*#__PURE__*/_jsx(SectionHeading, {
          compact: true,
          eyebrow: `Confirmation · ${confirmationLabel}`,
          title: "Hari Bol! You're registered! 🎉",
          subtitle: `${eventInfo.date} · ${eventInfo.venue}`
        }), /*#__PURE__*/_jsx(Reveal, {
          className: "mt-4 sm:mt-10",
          children: /*#__PURE__*/_jsx("div", {
            className: "rounded-[1.5rem] bg-gradient-gold p-[2px] shadow-warm sm:rounded-[2rem] sm:p-[3px]",
            children: /*#__PURE__*/_jsxs("div", {
              className: "relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-card p-4 pb-5 sm:rounded-[calc(2rem-2px)] sm:p-7 sm:pb-8",
              children: [/*#__PURE__*/_jsx(PatternBackdrop, {
                variant: "feather",
                className: "text-primary opacity-[0.06]"
              }), /*#__PURE__*/_jsx(PeacockFeather, {
                className: "pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-25"
              }), /*#__PURE__*/_jsxs("div", {
                className: "relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-3",
                children: [registrations.length > 1 && /*#__PURE__*/_jsx("button", {
                  "aria-label": "Previous member",
                  onClick: () => setIndex(i => (i - 1 + registrations.length) % registrations.length),
                  className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30 sm:h-12 sm:w-12",
                  children: /*#__PURE__*/_jsx(ChevronLeft, {
                    className: "h-5 w-5 sm:h-7 sm:w-7"
                  })
                }), /*#__PURE__*/_jsx(AnimatePresence, {
                  mode: "wait",
                  children: /*#__PURE__*/_jsxs(motion.div, {
                    initial: {
                      opacity: 0,
                      x: 30
                    },
                    animate: {
                      opacity: 1,
                      x: 0
                    },
                    exit: {
                      opacity: 0,
                      x: -30
                    },
                    className: `min-w-0 text-center ${registrations.length === 1 ? "col-span-3" : ""}`,
                    children: [/*#__PURE__*/_jsx("div", {
                      className: "mx-auto w-fit rounded-2xl bg-background p-3 shadow-warm ring-2 ring-primary/40 sm:rounded-3xl sm:p-4",
                      children: /*#__PURE__*/_jsx(QrSvg, {
                        value: member.signedPayload,
                        size: 170
                      })
                    }), /*#__PURE__*/_jsx("div", {
                      className: "mt-3 break-words font-display text-lg sm:mt-4 sm:text-2xl",
                      children: member.fullName
                    }), /*#__PURE__*/_jsxs("div", {
                      className: "text-[10px] tracking-[0.15em] text-muted-foreground uppercase sm:text-xs sm:tracking-[0.2em]",
                      children: ["Entry pass \xB7 ", member.entryCode]
                    })]
                  }, member.id)
                }), registrations.length > 1 && /*#__PURE__*/_jsx("button", {
                  "aria-label": "Next member",
                  onClick: () => setIndex(i => (i + 1) % registrations.length),
                  className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary/15 text-secondary ring-1 ring-secondary/30 sm:h-12 sm:w-12",
                  children: /*#__PURE__*/_jsx(ChevronRight, {
                    className: "h-5 w-5 sm:h-7 sm:w-7"
                  })
                })]
              }), registrations.length > 1 && /*#__PURE__*/_jsxs("div", {
                className: "relative mt-2 flex items-center justify-center gap-1.5 sm:mt-3",
                children: [registrations.map((m, i) => /*#__PURE__*/_jsx("button", {
                  "aria-label": `Show ${m.fullName}`,
                  onClick: () => setIndex(i),
                  className: `h-2.5 rounded-full transition-all ${i === safeIndex ? "w-8 bg-gradient-gold" : "w-2.5 bg-primary/35"}`
                }, m.id)), /*#__PURE__*/_jsxs("span", {
                  className: "ml-3 text-xs font-bold tracking-[0.15em] text-muted-foreground uppercase",
                  children: [safeIndex + 1, " / ", registrations.length]
                })]
              }), /*#__PURE__*/_jsx(GiftCard, {
                name: member.fullName
              }), /*#__PURE__*/_jsx(DownloadActions, {
                member: member,
                registrations: registrations,
                downloaded: downloaded,
                onDownload: markDownload,
                onDownloadAll: async () => {
                  for (const m of registrations) {
                    await markDownload(m);
                  }
                }
              }), /*#__PURE__*/_jsx("div", {
                className: "relative mt-3 sm:mt-4",
                children: /*#__PURE__*/_jsxs("a", {
                  href: googleCalendarUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-primary/15 px-3 py-2 font-display text-sm font-semibold text-secondary ring-1 ring-primary/35 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:min-h-11 sm:px-4",
                  children: [/*#__PURE__*/_jsx(CalendarDays, {
                    className: "h-4 w-4 shrink-0 sm:h-5 sm:w-5"
                  }), /*#__PURE__*/_jsx("span", {
                    children: "Add to Google Calendar"
                  })]
                })
              })]
            })
          })
        }), primary.wantsReferral && primary.referralCode && referralLink && /*#__PURE__*/_jsx(Reveal, {
          delay: 0.1,
          className: "mt-10",
          children: /*#__PURE__*/_jsx("div", {
            className: "rounded-[2rem] bg-gradient-peacock p-[3px] shadow-warm",
            children: /*#__PURE__*/_jsxs("div", {
              className: "relative overflow-hidden rounded-[calc(2rem-2px)] bg-gradient-cream p-6 sm:p-9",
              children: [/*#__PURE__*/_jsx(PatternBackdrop, {
                variant: "diya",
                className: "text-secondary opacity-[0.07]"
              }), /*#__PURE__*/_jsx(Lotus, {
                className: "pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 opacity-25"
              }), /*#__PURE__*/_jsxs("div", {
                className: "relative grid items-center gap-8 md:grid-cols-[auto_minmax(0,1fr)]",
                children: [/*#__PURE__*/_jsx("div", {
                  className: "mx-auto rounded-3xl bg-background p-4 shadow-warm ring-2 ring-secondary/35",
                  children: /*#__PURE__*/_jsx(QrSvg, {
                    value: referralLink,
                    size: 170
                  })
                }), /*#__PURE__*/_jsxs("div", {
                  className: "min-w-0",
                  children: [/*#__PURE__*/_jsx("h3", {
                    className: "font-display text-3xl",
                    children: "Share your Krishna code"
                  }), /*#__PURE__*/_jsx(Flourish, {
                    className: "mt-3 h-5 w-48"
                  }), /*#__PURE__*/_jsx("p", {
                    className: "mt-3 font-display text-2xl tracking-[0.15em] text-secondary",
                    children: primary.referralCode
                  }), /*#__PURE__*/_jsx("p", {
                    className: "mt-2 text-muted-foreground",
                    children: "Every bhakta who registers with your code lifts you up the leaderboard."
                  }), /*#__PURE__*/_jsxs("div", {
                    className: "mt-5 flex flex-wrap gap-3",
                    children: [/*#__PURE__*/_jsxs("a", {
                      href: `https://wa.me/?text=${encodeURIComponent(`Join me at Janmashtami Utsav 2026! Register with my code: ${referralLink}`)}`,
                      target: "_blank",
                      rel: "noreferrer",
                      className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105",
                      children: [/*#__PURE__*/_jsx(MessageCircle, {
                        className: "h-5 w-5"
                      }), " WhatsApp"]
                    }), /*#__PURE__*/_jsxs("a", {
                      href: `sms:?body=${encodeURIComponent(`Register for Janmashtami Utsav: ${referralLink}`)}`,
                      className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105",
                      children: [/*#__PURE__*/_jsx(Send, {
                        className: "h-5 w-5"
                      }), " SMS"]
                    }), /*#__PURE__*/_jsxs("button", {
                      type: "button",
                      onClick: () => navigator.clipboard?.writeText(referralLink),
                      className: "inline-flex min-h-11 items-center gap-2 rounded-full bg-primary/20 px-5 text-sm font-bold text-secondary ring-1 ring-primary/40 transition-transform hover:scale-105",
                      children: [/*#__PURE__*/_jsx(Instagram, {
                        className: "h-5 w-5"
                      }), " Copy link"]
                    })]
                  })]
                })]
              })]
            })
          })
        }), primary.wantsReferral && primary.referralCode ? /*#__PURE__*/_jsxs("div", {
          className: "mt-8 flex flex-wrap justify-center gap-4 sm:mt-10",
          children: [/*#__PURE__*/_jsx(FestiveIcon, {
            tone: "maroon",
            children: /*#__PURE__*/_jsx(PartyPopper, {
              className: "h-8 w-8",
              strokeWidth: 2.4
            })
          }), /*#__PURE__*/_jsx(Link, {
            to: "/leaderboard",
            className: "inline-flex min-h-12 items-center rounded-full bg-gradient-gold px-7 font-display font-semibold text-primary-foreground shadow-warm",
            children: "See where you rank"
          })]
        }) : /*#__PURE__*/_jsxs("div", {
          className: "mt-8 text-center sm:mt-10",
          children: [/*#__PURE__*/_jsx("p", {
            className: "text-sm text-muted-foreground",
            children: "Your entry pass is ready — see you at the utsav! 🙏"
          }), /*#__PURE__*/_jsx(Link, {
            to: "/",
            className: "mt-4 inline-flex min-h-11 items-center rounded-full bg-secondary/15 px-6 font-display font-semibold text-secondary ring-1 ring-secondary/35 transition hover:scale-105",
            children: "Back to home"
          })]
        })]
      })]
    })
  });
}