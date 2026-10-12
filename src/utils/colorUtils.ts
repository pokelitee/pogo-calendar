import { darkCategoryColors, lightCategoryColors } from '../config/colorMapping';
import type { ThemeMode } from '../types/settings';

/**
 * Generates a numeric hash from a string.
 *
 * @param str Input string to be hashed
 * @returns A numeric hash value
 */
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Gets a color for a given category. If the category has a predefined color in categoryColors,
 *
 * @param category The category name for which to get the color
 * @returns A string representing the color in HSL format
 */
export function getColorForCategory(category: string, mode: ThemeMode): string {
  const colorMap = mode === 'light' ? lightCategoryColors : darkCategoryColors;

  if (colorMap[category]) {
    return colorMap[category];
  }

  const hash = stringToHash(category);
  const hue = Math.abs(hash % 360);
  const saturation = mode === 'light' ? 70 : 60;
  const lightness = mode === 'light' ? 50 : 65;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Determines whether black or white text reads better against a given
 * background color, using the WCAG relative-luminance formula.
 *
 * @param color A CSS color string (hex, rgb, or hsl)
 * @returns '#000000' or '#ffffff'
 */
export function contrastColor(color: string): string {
  const rgb = colorToRgb(color);
  if (!rgb) return '#000000';

  const [r, g, b] = rgb.map((c) => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.45 ? '#000000' : '#ffffff';
}

/**
 * Returns the given CSS color as an rgba() string with the given alpha.
 */
export function colorWithAlpha(color: string, alpha: number): string {
  const rgb = colorToRgb(color);
  if (!rgb) return color;
  const [r, g, b] = rgb;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function colorToRgb(color: string): [number, number, number] | null {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  const hslMatch = color.match(/hsl\(\s*(\d+)[,\s]+(\d+)%[,\s]+(\d+)%\s*\)/i);
  if (hslMatch) {
    const [, h, s, l] = hslMatch.map(Number);
    return hslToRgb(h, s, l);
  }

  const rgbMatch = color.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    return [r, g, b];
  }

  return null;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r: number;
  let g: number;
  let b: number;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}
