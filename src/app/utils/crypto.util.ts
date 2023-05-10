// import { Buffer } from 'node:buffer'

export const fromStrToB64 = (buffer: string): string =>
  Buffer.from(buffer).toString('base64')

export const fromB64ToStr = (str: string): string =>
  Buffer.from(str, 'base64').toString('utf8')

export const fromBufferToB64 = (buffer: ArrayBuffer): string =>
  Buffer.from(buffer).toString('base64')

export const fromB64ToArray = (str: string): Uint8Array =>
  new Uint8Array(Buffer.from(str, 'base64'))

export const fromUtf8ToArray = (str: string): Uint8Array =>
  new Uint8Array(Buffer.from(str, 'utf8'))
