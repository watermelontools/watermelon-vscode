export default function getPlural(value: number): string {
  if (value === 1) {
    return "";
  }
  return "s";
}
