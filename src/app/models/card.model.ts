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

// the user state and card state and versions state are all stored in card storage
export interface UserState {
  // if this parameter change, even the password is the same, the key will be different
  passwordEncryptionStrength: number
  isRequiredLogin: boolean
  password: string
  salt: string
}
