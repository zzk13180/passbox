import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs'
import { writeFile, rename } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

export class Store {
  private data: Record<string, string> = {}
  private tempPath: string
  private locked = false
  private nextPromise: Promise<void> | null = null
  private nextData: string | null = null
  private prevResolve: (() => void) | null = null
  private prevReject: (() => void) | null = null
  private nextResolve: (() => void) | null = null
  private nextReject: (() => void) | null = null
  constructor(public path: string) {
    this.tempPath = join(dirname(path), `${basename(path)}.tmp`)
    mkdirSync(dirname(this.path), { recursive: true })
    if (!existsSync(this.path)) {
      this.writeSync('{}')
    } else {
      this.data = this.readSync()
    }
  }

  get(key: string) {
    return this.data[key]
  }

  set(key: string, value: string) {
    if (!(key in this.data) || this.data[key] !== value) {
      this.data[key] = value
      this.write(JSON.stringify(this.data))
    }
  }

  delete(key: string) {
    if (key in this.data) {
      delete this.data[key]
      this.write(JSON.stringify(this.data))
    }
  }

  clear() {
    this.data = {}
    return this.write('{}')
  }

  private write(data: string) {
    return this.locked ? this.addNext(data) : this.atomicWrite(data)
  }

  private addNext(data: string) {
    this.nextData = data
    if (!this.nextPromise) {
      this.nextPromise = new Promise((resolve, reject) => {
        this.nextResolve = resolve
        this.nextReject = reject
      })
    }
    return new Promise((resolve, reject) => this.nextPromise?.then(resolve).catch(reject))
  }

  private async atomicWrite(data: string) {
    this.locked = true
    try {
      await writeFile(this.tempPath, data, 'utf-8')
      await rename(this.tempPath, this.path)
      this.prevResolve?.()
    } catch (error) {
      this.prevReject?.()
      throw error
    } finally {
      this.locked = false
      this.prevResolve = this.nextResolve
      this.prevReject = this.nextReject
      this.nextResolve = null
      this.nextReject = null
      this.nextPromise = null
      if (this.nextData !== null) {
        const { nextData } = this
        this.nextData = null
        await this.write(nextData)
      }
    }
  }

  private writeSync(data: string) {
    writeFileSync(this.tempPath, data, 'utf-8')
    renameSync(this.tempPath, this.path)
  }

  private readSync() {
    try {
      return JSON.parse(readFileSync(this.path, 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {}
      }
      throw error
    }
  }
}
