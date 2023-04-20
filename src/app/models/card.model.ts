export interface Card {
  id: string
  sysname: string
  username: string
  password: string
  url: string
  width?: string // BrowserWindow width
  height?: string // BrowserWindow height
  passwordSee?: boolean
  panelOpened?: boolean
  isSearched?: boolean
  deleted: boolean
}

export type CardsFilter = 'ALL' | 'ACTIVE' | 'DELETED' | 'SEARCH'

export interface CardState {
  items: Array<Card>
  filter: CardsFilter
}

export enum CardFieldMap {
  username = 'username',
  password = 'password',
}
