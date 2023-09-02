export const cx = (
  ...classNames: (string | null | undefined | [string, boolean])[]
): string => {
  const set = new Set<string>();
  for (const className of classNames) {
    if (className == null) {
      continue;
    }
    if (typeof className === "string") {
      set.add(className);
      continue;
    }
    if (className[1]) {
      set.add(className[0]);
    }
  }
  return [...set].join(" ");
};
export const formatTime = (timeInSec: number) => {
  const minutes = Math.floor(timeInSec / 60);
  const seconds = Math.floor(timeInSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
