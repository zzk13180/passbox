export class CryptoUtils {
  static inited = false
  static isNativeScript = false
  static isNode = false
  static isBrowser = true
  static isAppleMobileBrowser = false
  static global: any = null
  static tldEndingRegex =
    /.*\.(com|net|org|edu|uk|gov|ca|de|jp|fr|au|ru|ch|io|es|us|co|xyz|info|ly|mil)$/

  static init() {
    if (Utils.inited) {
      return
    }
    Utils.inited = true
    Utils.isNode =
      typeof process !== 'undefined' &&
      (process as any).release != null &&
      (process as any).release.name === 'node'
    Utils.isBrowser = typeof window !== 'undefined'
    Utils.isNativeScript = !Utils.isNode && !Utils.isBrowser
    Utils.isAppleMobileBrowser = Utils.isBrowser && this.isAppleMobile(window)
    Utils.global =
      Utils.isNativeScript || (Utils.isNode && !Utils.isBrowser) ? global : window
  }

  static fromB64ToArray(str: string): Uint8Array {
    if (Utils.isNode || Utils.isNativeScript) {
      return new Uint8Array(Buffer.from(str, 'base64'))
    } else {
      const binaryString = window.atob(str)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes
    }
  }

  static fromUrlB64ToArray(str: string): Uint8Array {
    return Utils.fromB64ToArray(Utils.fromUrlB64ToB64(str))
  }

  static fromHexToArray(str: string): Uint8Array {
    if (Utils.isNode || Utils.isNativeScript) {
      return new Uint8Array(Buffer.from(str, 'hex'))
    } else {
      const bytes = new Uint8Array(str.length / 2)
      for (let i = 0; i < str.length; i += 2) {
        bytes[i / 2] = parseInt(str.substr(i, 2), 16)
      }
      return bytes
    }
  }

  static fromUtf8ToArray(str: string): Uint8Array {
    if (Utils.isNode || Utils.isNativeScript) {
      return new Uint8Array(Buffer.from(str, 'utf8'))
    } else {
      const strUtf8 = unescape(encodeURIComponent(str))
      const arr = new Uint8Array(strUtf8.length)
      for (let i = 0; i < strUtf8.length; i++) {
        arr[i] = strUtf8.charCodeAt(i)
      }
      return arr
    }
  }

  static fromByteStringToArray(str: string): Uint8Array {
    const arr = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      arr[i] = str.charCodeAt(i)
    }
    return arr
  }

  static fromBufferToB64(buffer: ArrayBuffer): string {
    if (Utils.isNode || Utils.isNativeScript) {
      return Buffer.from(buffer).toString('base64')
    } else {
      let binary = ''
      const bytes = new Uint8Array(buffer)
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      return window.btoa(binary)
    }
  }

  static fromBufferToUrlB64(buffer: ArrayBuffer): string {
    return Utils.fromB64toUrlB64(Utils.fromBufferToB64(buffer))
  }

  static fromB64toUrlB64(b64Str: string) {
    return b64Str.replace(/\+/g, '-').replace(/\//g, '_').replace(/[=]/g, '')
  }

  static fromBufferToUtf8(buffer: ArrayBuffer): string {
    if (Utils.isNode || Utils.isNativeScript) {
      return Buffer.from(buffer).toString('utf8')
    } else {
      const bytes = new Uint8Array(buffer)
      const encodedString = String.fromCharCode.apply(null, bytes)
      return decodeURIComponent(escape(encodedString))
    }
  }

  static fromBufferToByteString(buffer: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buffer))
  }

  static fromBufferToHex(buffer: ArrayBuffer): string {
    if (Utils.isNode || Utils.isNativeScript) {
      return Buffer.from(buffer).toString('hex')
    } else {
      const bytes = new Uint8Array(buffer)
      return Array.prototype.map
        .call(bytes, (x: number) => `00${x.toString(16)}`.slice(-2))
        .join('')
    }
  }

  static fromUrlB64ToB64(urlB64Str: string): string {
    let output = urlB64Str.replace(/-/g, '+').replace(/_/g, '/')
    switch (output.length % 4) {
      case 0:
        break
      case 2:
        output += '=='
        break
      case 3:
        output += '='
        break
      default:
        throw new Error('Illegal base64url string!')
    }

    return output
  }

  static fromUrlB64ToUtf8(urlB64Str: string): string {
    return Utils.fromB64ToUtf8(Utils.fromUrlB64ToB64(urlB64Str))
  }

  static fromB64ToUtf8(b64Str: string): string {
    if (Utils.isNode || Utils.isNativeScript) {
      return Buffer.from(b64Str, 'base64').toString('utf8')
    } else {
      return decodeURIComponent(escape(window.atob(b64Str)))
    }
  }

  static isGuid(id: string) {
    return RegExp(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      'i',
    ).test(id)
  }

  static isNullOrWhitespace(str: string): boolean {
    return str == null || typeof str !== 'string' || str.trim() === ''
  }

  static nameOf<T>(name: string & keyof T) {
    return name
  }

  static assign<T>(target: T, source: Partial<T>): T {
    return Object.assign(target, source)
  }

  private static isAppleMobile(win: Window) {
    return (
      win.navigator.userAgent.match(/iPhone/i) != null ||
      win.navigator.userAgent.match(/iPad/i) != null
    )
  }
}

CryptoUtils.init()
