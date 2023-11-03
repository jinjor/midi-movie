export function setStyles(el, patch) {
  for (const [key, value] of Object.entries(patch)) {
    el.style.setProperty(key, String(value));
  }
}

export function setAttributes(el, patch) {
  for (const [key, value] of Object.entries(patch)) {
    el.setAttributeNS(null, key, String(value));
  }
}

export function createSvgElement(kind) {
  return document.createElementNS("http://www.w3.org/2000/svg", kind);
}
