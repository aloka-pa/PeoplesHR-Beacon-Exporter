function stringToUint8Array(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i) & 0xff; // take lowest byte only
  }
  return new Blob([bufView], { type: 'application/pdf' });
}
