export function createSvgElement(kind: string) {
  return document.createElementNS("http://www.w3.org/2000/svg", kind);
}
export function getStyle(el: SVGElement, key: string) {
  return el.style.getPropertyValue(key);
}
export function setStyles(
  el: SVGElement,
  patch: Record<string, string | number>,
) {
  for (const [key, value] of Object.entries(patch)) {
    el.style.setProperty(key, String(value));
  }
}
export function setAttributes(
  el: SVGElement,
  patch: Record<string, string | number>,
) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}
