const { contextBridge, ipcRenderer } = require('electron')

class EventRegistry {
  #eventMap = new Map()

  registry(handler) {
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
    const uuid = crypto.randomUUID()
    this.#eventMap.set(uuid, handler)
    return uuid
  }

  emit(uuid, ...args) {
    const handler = this.#eventMap.get(uuid)
    if (handler) {
      handler(...args)
      return true
    }
    return false
  }

  off(uuid) {
    this.#eventMap.delete(uuid)
  }

  clear() {
    this.#eventMap.clear()
  }
}

const eventRegistry = new EventRegistry()

const globals = {
  ipcRenderer: {
    send(channel, ...args) {
      ipcRenderer.send(channel, ...args)
    },
    invoke(channel, ...args) {
      return ipcRenderer.invoke(channel, ...args)
    },
  },
  process: {
    get platform() {
      return process.platform
    },
    get arch() {
      return process.arch
    },
    getProcessMemoryInfo() {
      return process.getProcessMemoryInfo()
    },
  },
  crypto: {
    pbkdf2Sync(...args) {
      return ipcRenderer.invoke('crypto-pbkdf2-sync', ...args)
    },
    createDecipheriv(...args) {
      return ipcRenderer.invoke('crypto-create-decipheriv', ...args)
    },
    createCipheriv(...args) {
      return ipcRenderer.invoke('crypto-create-cipheriv', ...args)
    },
  },
  dialog: {
    showMessageBox(options, cb) {
      const eventId = eventRegistry.registry(cb)
      ipcRenderer.send('show-message-box', options, eventId)
    },
    showOpenDialog(options, cb) {
      const eventId = eventRegistry.registry(cb)
      ipcRenderer.send('show-open-dialog', options, eventId)
    },
  },
  menu: {
    popupMenu(menus) {
      ipcRenderer.send(
        'popup-menu',
        menus.map(menu => ({
          label: menu.label,
          eventId: eventRegistry.registry(menu.cb),
        })),
      )
    },
  },
  customLocalStorage: {
    setItem(key, value) {
      ipcRenderer.send('custom-local-storage-set-item', key, value)
    },
    getItem(key) {
      return ipcRenderer.sendSync('custom-local-storage-get-item', key)
    },
    removeItem(key) {
      ipcRenderer.send('custom-local-storage-remove-item', key)
    },
    clear() {
      ipcRenderer.send('custom-local-storage-clear')
    },
  },
}

contextBridge.exposeInMainWorld('electronAPI', globals)

ipcRenderer.on('show-message-box-reply', (_, eventId, ...args) => {
  eventRegistry.emit(eventId, ...args)
  eventRegistry.off(eventId)
})

ipcRenderer.on('show-open-dialog-reply', (_, eventId, ...args) => {
  eventRegistry.emit(eventId, ...args)
  eventRegistry.off(eventId)
})

ipcRenderer.on('popup-menu-click', (_, eventId) => {
  eventRegistry.emit(eventId)
})

ipcRenderer.on('popup-menu-close', (_, eventIds) => {
  eventIds.forEach(eventId => {
    eventRegistry.off(eventId)
  })
})
