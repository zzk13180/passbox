export interface Card {
  id: string
  title: string
  description: string
  secret: string
  url: string
  width?: number
  height?: number
}

export interface CardState {
  term: string
  items: Array<Card>
  deletedItems: Array<Card>
}

export enum CardFieldMap {
  title = 'title',
  description = 'description',
  url = 'url',
}
