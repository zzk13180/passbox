import { DecryptParameters } from '../domain/decryptParameters'

export abstract class CryptoFunctionService {
  pbkdf2: (
    password: string | ArrayBuffer,
    salt: string | ArrayBuffer,
    algorithm: 'sha256' | 'sha512',
    iterations: number,
  ) => Promise<ArrayBuffer>

  aesEncrypt: (
    data: ArrayBuffer,
    iv: ArrayBuffer,
    key: ArrayBuffer,
  ) => Promise<ArrayBuffer>

  aesDecryptFastParameters: (
    data: string,
    iv: string,
    key: ArrayBuffer,
  ) => DecryptParameters<ArrayBuffer | string>

  aesDecryptFast: (parameters: DecryptParameters<ArrayBuffer | string>) => Promise<string>

  randomBytes: (length: number) => Promise<ArrayBuffer>
}
