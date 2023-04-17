export interface Card {
  id: string
  sysname: string
  username: string
  password: string
  deleted: boolean
  url: string
  width?: string // BrowserWindow width
  height?: string // BrowserWindow height
  passwordSee?: boolean
  panelOpened?: boolean
}

export type CardsFilter = 'ALL' | 'ACTIVE'

export interface CardState {
  items: Array<Card>
  filter: CardsFilter
}

export enum CardFieldMap {
  username = 'username',
  password = 'password',
}
