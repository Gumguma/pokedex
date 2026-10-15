function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function textOn(hex) {
  const l = luminance(hex);
  const contrastWith = (inkHex) => {
    const li = luminance(inkHex);
    const [hi, lo] = l >= li ? [l, li] : [li, l];
    return (hi + 0.05) / (lo + 0.05);
  };
  return contrastWith('#0f172a') >= contrastWith('#ffffff') ? '#0f172a' : '#ffffff';
}
