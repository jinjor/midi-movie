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
