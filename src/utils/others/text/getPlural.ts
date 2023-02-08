export default function getPlural(value: number): string {
  if (!value) {
    return "";
  } else if (value === 1) {
    return "";
  }
  return "s";
}
