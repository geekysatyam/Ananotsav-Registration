import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/lib/site-config";
import { Flourish, PeacockFeather } from "@/components/motifs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function PosterSlide({ competition }) {
  const [failed, setFailed] = useState(false);
  const theme = competition.theme ?? { from: "#08495B", to: "#126B82" };
  const title = competition.shortTitle ?? competition.title;
  const showImage = Boolean(competition.poster) && !failed;

  return (
    <Link
      to="/competitions"
      hash={competition.id}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7D98A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a5062]"
    >
      <figure className="group relative aspect-[2/3] overflow-hidden rounded-[1.35rem] shadow-[0_20px_50px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/25">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(165deg, ${theme.from} 0%, ${theme.to} 100%)`,
          }}
        />

        {showImage ? (
          <img
            src={competition.poster}
            alt=""
            width={1024}
            height={1536}
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <PeacockFeather className="h-16 w-16 text-[#F7D98A]/70" aria-hidden />
            <p className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</p>
            <p className="max-w-[14rem] text-sm leading-relaxed text-[#F7D98A]/90">
              {competition.tagline}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#042830]/90 via-transparent to-transparent" />

        {/* Caption only when poster is missing — avoids doubling SVG poster titles */}
        {showImage ? (
          <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="text-center text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase transition group-hover:text-[#F7D98A]">
              View details
            </p>
          </figcaption>
        ) : (
          <figcaption className="sr-only">
            {title}. {competition.tagline}
          </figcaption>
        )}
      </figure>
    </Link>
  );
}

const arrowClass =
  "absolute z-10 top-1/2 hidden h-11 w-11 -translate-y-1/2 rounded-full border-2 border-[#F7D98A]/70 !bg-[#F7D98A] !text-[#08495B] shadow-lg hover:!bg-white hover:!border-white sm:flex";

export function CompetitionsCarousel() {
  const competitions = siteConfig.competitions ?? [];
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userInteracting, setUserInteracting] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    const onPointerDown = () => setUserInteracting(true);
    const onPointerUp = () => setUserInteracting(false);
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const timer = setInterval(() => {
      if (!userInteracting) api.scrollNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [api, userInteracting]);

  if (!competitions.length) return null;

  return (
    <section id="competition" className="jh-section-blue relative overflow-hidden py-14 text-white sm:py-16">
      <div className="jh-pattern opacity-[0.06]" />
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold tracking-[0.2em] text-[#F7D98A] uppercase">Competitions</div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
            Three ways to <span className="text-[#F7D98A]">celebrate</span>
          </h2>
          <Flourish className="mx-auto mt-4 h-5 w-40" />
          <p className="mt-3 text-sm leading-7 text-white/75 sm:text-base">
            Referral challenge, kids fancy dress, and Laddu Gopal shringar — explore the posters and join in.
          </p>
        </div>

        <div className="relative mx-auto mt-10 max-w-5xl px-1 sm:px-12 lg:px-14">
          <Carousel
            key={isMobile ? "comp-mobile" : "comp-desktop"}
            setApi={setApi}
            opts={{ align: "center", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 py-2 sm:-ml-4">
              {competitions.map((competition, index) => (
                <CarouselItem
                  key={competition.id}
                  className="basis-[78%] pl-3 sm:basis-[44%] sm:pl-4 lg:basis-[31%]"
                >
                  <div
                    className={cn(
                      "h-full transition-[transform,opacity] duration-500",
                      index === activeIndex ? "scale-100 opacity-100" : "scale-[0.94] opacity-70",
                    )}
                  >
                    <PosterSlide competition={competition} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              variant="secondary"
              size="icon"
              disabled={false}
              className={cn(arrowClass, "-left-1 lg:-left-4")}
            />
            <CarouselNext
              variant="secondary"
              size="icon"
              disabled={false}
              className={cn(arrowClass, "-right-1 lg:-right-4")}
            />
          </Carousel>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2">
              {competitions.map((c, index) => (
                <button
                  key={c.id}
                  type="button"
                  aria-label={`Go to ${c.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => api?.scrollTo(index)}
                  className="grid min-h-11 min-w-11 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all duration-500",
                      index === activeIndex ? "w-7 bg-[#F7D98A]" : "w-2 bg-white/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] font-semibold tracking-wide text-white/55 uppercase sm:hidden">
              Swipe posters · tap to open
            </p>
            <Link
              to="/competitions"
              className="inline-flex items-center justify-center rounded-xl bg-[#F7D98A] px-6 py-2.5 text-sm font-extrabold text-[#08495B] shadow-md transition hover:bg-white"
            >
              View all competitions →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
