export interface Card {
  id: string
  sysname: string
  username: string
  password: string
  url: string
  width?: number // BrowserWindow width
  height?: number // BrowserWindow height
}

export interface CardState {
  term: string
  items: Array<Card>
  deletedItems: Array<Card>
}

export enum CardFieldMap {
  username = 'username',
  password = 'password',
}
