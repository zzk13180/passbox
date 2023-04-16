import { CipherString } from '../domain/cipherString'
import { SymmetricCryptoKey } from '../domain/symmetricCryptoKey'

export abstract class CryptoService {
  encrypt: (
    plainValue: string | ArrayBuffer,
    key?: SymmetricCryptoKey,
  ) => Promise<CipherString>

  decryptToUtf8: (cipherString: CipherString, key?: SymmetricCryptoKey) => Promise<string>
  randomNumber: (min: number, max: number) => Promise<number>
}
