export class CipherString {
  data?: string
  iv?: string

  constructor(data?: string, iv?: string) {
    this.data = data
    this.iv = iv
  }
}
