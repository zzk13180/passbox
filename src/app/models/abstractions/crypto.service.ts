import { CipherString } from '../domain/cipherString'

export abstract class CryptoService {
  encrypt: (plainValue: string | ArrayBuffer) => Promise<CipherString>

  decryptToUtf8: (cipherString: CipherString) => Promise<string>

  randomNumber: (min: number, max: number) => Promise<number>
}
