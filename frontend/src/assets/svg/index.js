import { createSvgIcon, createPatternBackdrop, prepareIllustrationSvg } from "./create-icon.jsx";

import peacockFeatherRaw from "./peacock-feather.svg?raw";
import diyaRaw from "./diya.svg?raw";
import lotusRaw from "./lotus.svg?raw";
import fluteRaw from "./flute.svg?raw";
import keychainRaw from "./keychain.svg?raw";
import cushionRaw from "./Cusiopn.svg?raw";
import krishnaRaw from "./krishna.svg?raw";
import templeSilhouetteRaw from "./temple-silhouette.svg?raw";
import peacockFanRaw from "./peacock-fan.svg?raw";
import flourishRaw from "./flourish.svg?raw";

import patternMandalaRaw from "./pattern-mandala.svg?raw";
import patternFeatherRaw from "./pattern-feather.svg?raw";
import patternDiyaRaw from "./pattern-diya.svg?raw";

export const PeacockFeather = createSvgIcon(peacockFeatherRaw, "PeacockFeather");
export const Diya = createSvgIcon(diyaRaw, "Diya");
export const Lotus = createSvgIcon(lotusRaw, "Lotus");
export const Flute = createSvgIcon(fluteRaw, "Flute");
export const Keychain = createSvgIcon(keychainRaw, "Keychain");
export const Cushion = createSvgIcon(prepareIllustrationSvg(cushionRaw), "Cushion");
export const Krishna = createSvgIcon(prepareIllustrationSvg(krishnaRaw), "Krishna");
export const TempleSilhouette = createSvgIcon(templeSilhouetteRaw, "TempleSilhouette");
export const PeacockFan = createSvgIcon(peacockFanRaw, "PeacockFan");
export const Flourish = createSvgIcon(flourishRaw, "Flourish");

export const PatternBackdrop = createPatternBackdrop({
  mandala: patternMandalaRaw,
  feather: patternFeatherRaw,
  diya: patternDiyaRaw,
});

/** All motif icons keyed by file name (without .svg). */
export const svgIcons = {
  PeacockFeather,
  Diya,
  Lotus,
  Flute,
  Keychain,
  Cushion,
  Krishna,
  TempleSilhouette,
  PeacockFan,
  Flourish,
  PatternBackdrop,
};
