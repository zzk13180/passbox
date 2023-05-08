export const fromBufferToB64 = (buffer: ArrayBuffer): string =>
  Buffer.from(buffer).toString('base64')

export const fromB64ToArray = (str: string): Uint8Array =>
  new Uint8Array(Buffer.from(str, 'base64'))

export const fromUtf8ToArray = (str: string): Uint8Array =>
  new Uint8Array(Buffer.from(str, 'utf8'))
