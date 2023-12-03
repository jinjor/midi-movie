export const putInRange = (start: number, end: number, ratio: number) => {
  return start + (end - start) * ratio;
};
export const ratio = (start: number, end: number, value: number) => {
  return (value - start) / (end - start);
};
