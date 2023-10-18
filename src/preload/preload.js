const { contextBridge, ipcRenderer } = require('electron')

const eventEmitter = new EventEmitter()

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
    randomBytes(...args) {
      return ipcRenderer.invoke('crypto-random-bytes', ...args)
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
      const eventId = eventEmitter.registry(cb)
      ipcRenderer.send('show-message-box', options, eventId)
    },
    showOpenDialog(options, cb) {
      const eventId = eventEmitter.registry(cb)
      ipcRenderer.send('show-open-dialog', options, eventId)
    },
  },
  menu: {
    popupMenu(menus) {
      ipcRenderer.send(
        'popup-menu',
        menus.map(menu => ({
          label: menu.label,
          eventId: eventEmitter.registry(menu.cb),
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
  eventEmitter.emit(eventId, ...args)
  eventEmitter.off(eventId)
})

ipcRenderer.on('show-open-dialog-reply', (_, eventId, ...args) => {
  eventEmitter.emit(eventId, ...args)
  eventEmitter.off(eventId)
})

ipcRenderer.on('popup-menu-click', (_, eventId) => {
  eventEmitter.emit(eventId)
})

ipcRenderer.on('popup-menu-close', (_, eventIds) => {
  eventIds.forEach(eventId => {
    eventEmitter.off(eventId)
  })
})

function EventEmitter() {
  const eventMap = new Map()
  return {
    registry(handler) {
      const uuid = crypto.randomUUID()
      eventMap.set(uuid, handler)
      return uuid
    },
    emit(uuid, ...args) {
      eventMap.get(uuid)?.(...args)
    },
    off(uuid) {
      eventMap.delete(uuid)
    },
    clear() {
      eventMap.clear()
    },
  }
}
