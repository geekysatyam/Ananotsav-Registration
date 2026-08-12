import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site-config";
import { Flourish } from "@/components/motifs";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const DEFAULT_THEME = { from: "#FFFCF5", to: "#126B82" };

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const num = Number.parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function GalleryPhoto({ photo }) {
  const [failed, setFailed] = useState(false);
  const label = photo.caption ?? photo.alt;

  return (
    <div className="h-full pb-1">
      <figure className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#08495B]/5 shadow-[0_10px_40px_-12px_rgba(8,73,91,0.35)] ring-1 ring-white/40">
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EEF9F8] via-[#FFF8E7] to-[#126B82]/25 px-6 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-white/80 font-display text-lg font-bold text-[#08495B] shadow-sm">
              {photo.year ?? "A"}
            </div>
            <p className="text-sm font-semibold text-[#08495B]">{label}</p>
          </div>
        ) : (
          <img
            src={photo.src}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08495B]/80 via-[#08495B]/15 to-transparent" />

        {photo.year ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#08495B] uppercase shadow-sm">
            {photo.year}
          </span>
        ) : null}

        <figcaption className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-sm">{label}</p>
        </figcaption>
      </figure>
    </div>
  );
}

export function AnandotsavGallery() {
  const { title, subtitle, photos } = siteConfig.event.gallery;
  const [api, setApi] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useIsMobile();

  const theme = photos[activeIndex]?.theme ?? DEFAULT_THEME;

  const [userInteracting, setUserInteracting] = useState(false);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, userInteracting]);

  if (!photos?.length) return null;

  return (
    <section
      id="memories"
      className="relative overflow-hidden border-y border-[#D89B24]/10 py-10 transition-[background] duration-700 ease-out sm:py-16"
      style={{
        background: `linear-gradient(180deg, #FFFCF5 0%, ${rgba(theme.from, 0.28)} 38%, ${rgba(theme.to, 0.22)} 72%, #ffffff 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-[opacity,background] duration-700 ease-out"
        style={{
          background: `
            radial-gradient(circle at 18% 22%, ${rgba(theme.from, 0.35)}, transparent 42%),
            radial-gradient(circle at 82% 78%, ${rgba(theme.to, 0.3)}, transparent 40%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#FFFCF5] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-10">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#D89B24] uppercase sm:text-xs">
            Past celebrations
          </p>
          <h2 className="mt-2 font-display text-xl font-bold text-[#08495B] sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mx-auto mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 sm:line-clamp-none sm:text-base">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-4 flex justify-center">
            <Flourish className="h-5 w-40 max-w-full" />
          </div>
        </div>

        <div className="relative mx-auto max-w-6xl px-1 sm:px-8 lg:px-14">
          <Carousel
            key={isMobile ? "gallery-mobile" : "gallery-desktop"}
            setApi={setApi}
            opts={{ align: isMobile ? "center" : "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 py-1 sm:-ml-4 sm:py-2">
              {photos.map((photo, index) => (
                <CarouselItem
                  key={photo.src}
                  className="basis-[90%] pl-2 sm:basis-1/2 sm:pl-4 lg:basis-1/3"
                >
                  <div
                    className={cn(
                      "h-full transition-[transform,opacity] duration-500",
                      !isMobile && index === activeIndex && "scale-100 opacity-100",
                      !isMobile && index !== activeIndex && "scale-[0.97] opacity-90",
                    )}
                  >
                    <GalleryPhoto photo={photo} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious
              variant="outline"
              size="icon"
              className={cn(
                "absolute z-10 hidden h-9 w-9 rounded-full border-white/60 bg-white/90 text-[#08495B] shadow-md backdrop-blur-sm hover:bg-white sm:flex sm:h-10 sm:w-10",
                "top-1/2 -left-2 -translate-y-1/2 lg:-left-4",
              )}
            />
            <CarouselNext
              variant="outline"
              size="icon"
              className={cn(
                "absolute z-10 hidden h-9 w-9 rounded-full border-white/60 bg-white/90 text-[#08495B] shadow-md backdrop-blur-sm hover:bg-white sm:flex sm:h-10 sm:w-10",
                "top-1/2 -right-2 -translate-y-1/2 lg:-right-4",
              )}
            />
          </Carousel>

          <div className="mt-4 flex flex-col items-center gap-2 sm:mt-5">
            <div className="flex items-center justify-center gap-2">
              {photos.map((photo, index) => (
                <button
                  key={photo.src}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => api?.scrollTo(index)}
                  className="grid min-h-11 min-w-11 place-items-center"
                >
                  <span
                    className={cn(
                      "block h-2 rounded-full transition-all duration-500",
                      index === activeIndex ? "w-6" : "w-2 bg-[#08495B]/25",
                    )}
                    style={
                      index === activeIndex
                        ? { backgroundColor: photo.theme?.to ?? "#08495B" }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>
            <p className="text-[10px] font-semibold tracking-wide text-[#08495B]/55 uppercase sm:hidden">
              Swipe to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
