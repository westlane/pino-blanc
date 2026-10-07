export function padEndDisplay(text: string, width: number): string {
  if (text.length >= width) {
    return text;
  }
  return text + " ".repeat(width - text.length);
}

export function padStartDisplay(text: string, width: number): string {
  if (text.length >= width) {
    return text;
  }
  return " ".repeat(width - text.length) + text;
}
