export interface Card {
  id: string
  sysname: string
  username: string
  password: string
  url: string
  width?: number // BrowserWindow width
  height?: number // BrowserWindow height
  passwordSee?: boolean
  panelOpened?: boolean
}

export type CardsFilter = 'ALL' | 'ACTIVE' | 'DELETED'

export interface CardState {
  term: string
  items: Array<Card>
  filter: CardsFilter
  deletedItems: Array<Card>
}

export enum CardFieldMap {
  username = 'username',
  password = 'password',
}
