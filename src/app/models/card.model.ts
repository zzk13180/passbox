export interface Card {
  id: string
  url: string
  sysname: string
  username: string
  password: string
  deleted: boolean
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
