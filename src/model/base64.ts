export const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  return bytes.map((_byte, i) => binaryString.charCodeAt(i));
};
export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const binaryString = bytes.reduce(
    (acc, byte) => acc + String.fromCharCode(byte),
    "",
  );
  return window.btoa(binaryString);
};
