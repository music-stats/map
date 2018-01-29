interface Color {
  r: number;
  g: number;
  b: number;
}

export function getColorString(color: Color, opacity: number = 1): string {
  const {r, g, b} = color;

  return `rgba(${r}, ${g}, ${b}, ${Number(opacity.toFixed(2))})`;
}
