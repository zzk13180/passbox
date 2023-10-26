export interface DecryptParameters<T> {
  encKey: T
  data: T
  iv: T
  macData: T
}
