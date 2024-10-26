export function randomId(): string {
  const buf = new Uint8Array(8);
  window.crypto.getRandomValues(buf);
  return Buffer.from(buf).toString("hex");
}
