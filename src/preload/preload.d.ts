declare global {
  interface Window {
    electronAPI: {
      ipcRenderer: {
        invoke: (channel: string, ...args: any[]) => Promise<any>
        send: (channel: string, ...args: any[]) => void
      }
      process: {
        platform: string
        arch: string
        getProcessMemoryInfo: () => Promise<{ private: number }>
      }
      crypto: {
        pbkdf2Sync: (
          password: any,
          salt: any,
          iterations: number,
          keylen: number,
          digest: string,
        ) => Promise<any>
        randomBytes: (size: number) => Promise<any>
        createCipheriv: (algorithm: string, key: any, iv: any, data: any) => Promise<any>
        createDecipheriv: (
          algorithm: string,
          key: any,
          iv: any,
          data: any,
        ) => Promise<any>
      }
      menu: {
        popupMenu: (menus: { label: string; cb: () => void }[]) => void
      }
      dialog: {
        showMessageBox: (options: any, cb: (...args: any[]) => void) => void
        showOpenDialog: (options: any, cb: (...args: any[]) => void) => void
      }
    }
  }
}
export {}
