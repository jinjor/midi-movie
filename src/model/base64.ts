export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const str = window.atob(base64);
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
};
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const str = String.fromCharCode.apply(
    null,
    new Uint8Array(buffer) as unknown as number[],
  );
  return window.btoa(str);
};
