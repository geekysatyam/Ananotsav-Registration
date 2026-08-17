import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { PatternBackdrop, PeacockFeather, Flourish } from "./motifs";
import { siteConfig } from "@/lib/site-config";

const socialDefs = [
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
];

export function Footer() {
  const { brand, organization, contact, social } = siteConfig;
  const activeSocials = socialDefs.filter((s) => social[s.key]);

  return (
    <footer className="relative overflow-hidden bg-gradient-peacock text-secondary-foreground">
      <PatternBackdrop variant="feather" className="text-primary opacity-[0.09]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/30">
              <PeacockFeather className="h-8 w-8" />
            </span>
            <span className="font-display text-2xl">{brand.shortName} Utsav</span>
          </div>
          <Flourish className="mt-4 h-5 w-48" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-90">{organization.about}</p>
        </div>

        <div>
          <h3 className="font-display text-xl">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link to="/register" className="opacity-90 hover:opacity-100">
              Register
            </Link>
            <Link to="/competitions" className="opacity-90 hover:opacity-100">
              Competitions
            </Link>
            <Link to="/leaderboard" className="opacity-90 hover:opacity-100">
              Leaderboard
            </Link>
            <Link to="/event-details" className="opacity-90 hover:opacity-100">
              Event Details
            </Link>
            <Link to="/find" className="opacity-90 hover:opacity-100">
              Find My Registration
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-display text-xl">{contact.deskHeading}</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/25 text-primary">
                <Phone className="h-5 w-5" />
              </span>
              <a href={contact.phoneHref} className="hover:underline">
                {contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/25 text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <a href={contact.emailHref} className="hover:underline">
                {contact.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/25 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <span>{contact.location}</span>
            </li>
          </ul>
          {activeSocials.length > 0 && (
            <div className="mt-5 flex gap-3">
              {activeSocials.map(({ key, Icon, label }) => (
                <a
                  key={key}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid h-12 w-12 place-items-center rounded-full bg-primary/25 text-primary ring-1 ring-primary/40 transition-transform hover:scale-110"
                >
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="relative border-t border-primary/25 py-5 text-center text-xs opacity-80">
        © {organization.copyrightYear} {organization.name} · {organization.footerTagline}
      </div>
    </footer>
  );
}
