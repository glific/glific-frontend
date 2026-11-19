// A port of the backend's Glific.WebChannel.Branding.readable_on/1, which picks the text colour
// the web chat paints over the brand colour. The preview on the settings page is only honest
// while the two agree, so a change to one has to be made to the other.
const ON_DARK = '#fafafa';
const ON_LIGHT = '#18181b';

const HEX = /^#[0-9a-f]{6}$/i;

// Every channel within this of 255 reads as white with a tint, not as a colour. Judged per
// channel rather than by contrast with white, because a saturated yellow or mint has almost no
// contrast with white either, and those are colours the chat is designed to handle.
const NEAR_WHITE_CHANNEL = 0xe6;

const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

const relativeLuminance = (hex: string) => {
  const [r, g, b] = channels(hex).map((value) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const isHexColour = (value?: string): value is string => !!value && HEX.test(value);

export const contrastRatio = (first: string, second: string) => {
  const [lighter, darker] = [relativeLuminance(first), relativeLuminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

export const readableOn = (hex: string) =>
  contrastRatio(hex, ON_LIGHT) >= contrastRatio(hex, ON_DARK) ? ON_LIGHT : ON_DARK;

export const isNearWhite = (hex: string) => channels(hex).every((value) => value >= NEAR_WHITE_CHANNEL);
