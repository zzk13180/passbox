export const fromStrToB64 = (buffer: string) => btoa(buffer)

export const fromB64ToStr = (str: string) => atob(str)

export const fromBufferToB64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))

export const fromB64ToArray = (str: string) =>
  Uint8Array.from(atob(str), char => char.charCodeAt(0))

export const fromUtf8ToArray = (str: string) => new TextEncoder().encode(str)
