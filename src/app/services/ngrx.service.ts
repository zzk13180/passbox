import { v4 as uuid } from 'uuid'
import {
  createReducer,
  on,
  Action,
  createAction,
  props,
  createSelector,
} from '@ngrx/store'
import { Card, CardState } from '../models'

export const initCards = createAction(
  '[Card List] InitCards',
  props<{ cards: Array<Card> }>(),
)
export const add = createAction('[Card List] AddItem', props<{ card: Card }>())
export const modify = createAction('[Card List] ModifyItem', props<{ card: Card }>())
export const remove = createAction('[Card List] RemoveItem', props<{ card: Card }>())
export const togglePasswordSee = createAction(
  '[Card List] TogglePasswordSee',
  props<{ card: Card }>(),
)
export const togglePanelOpened = createAction(
  '[Card List] TogglePanelOpened',
  props<{ card: Card }>(),
)
export const sort = createAction(
  '[Card List] Sort',
  props<{ previousIndex: number; currentIndex: number }>(),
)
export const search = createAction('[Card List] Search', props<{ term: string }>())
const initialState: CardState = {
  items: [],
  filter: 'ACTIVE',
}
export const _reducer = createReducer(
  initialState,
  on(initCards, (state, { cards }) => ({
    ...state,
    items: [...cards],
  })),
  on(add, (state, { card }) => ({
    ...state,
    items: [{ ...card, id: uuid(), deleted: false }, ...state.items],
  })),
  on(modify, (state, { card }) => ({
    ...state,
    items: state.items.map((item: Card) =>
      item.id === card.id ? { ...item, ...card } : item,
    ),
  })),
  on(remove, (state, { card }) => ({
    ...state,
    items: state.items.map((item: Card) =>
      item.id === card.id ? { ...item, deleted: true } : item,
    ),
  })),
  on(togglePasswordSee, (state, { card }) => ({
    ...state,
    items: state.items.map((item: Card) =>
      item.id === card.id ? { ...item, passwordSee: !item.passwordSee } : item,
    ),
  })),
  on(togglePanelOpened, (state, { card }) => ({
    ...state,
    items: state.items.map((item: Card) =>
      item.id === card.id ? { ...item, panelOpened: !item.panelOpened } : item,
    ),
  })),
  on(sort, (state, { previousIndex, currentIndex }) => {
    const items = [...state.items]
    const [removed] = items.splice(previousIndex, 1)
    items.splice(currentIndex, 0, removed)
    return { ...state, items }
  }),
  on(search, (state, { term }) => ({
    ...state,
    filter: 'SEARCH',
    items: state.items.map((item: Card) => {
      const sysname = item.sysname.toLowerCase()
      const username = item.username.toLowerCase()
      const password = item.password.toLowerCase()
      const termLower = term.toLowerCase()
      const sysnameMatch = sysname.includes(termLower)
      const usernameMatch = username.includes(termLower)
      const passwordMatch = password.includes(termLower)
      return { ...item, isSearched: sysnameMatch || usernameMatch || passwordMatch }
    }),
  })),
)

export function cardReducer(state: CardState, action: Action) {
  return _reducer(state, action)
}

export const selectorItems = (state: CardState) => state.items
export const selectorFilter = (state: CardState) => state.filter

export const selectCards = createSelector(
  selectorItems,
  selectorFilter,
  (items, filter) => {
    let predicate = null
    switch (filter) {
      case 'ALL':
        predicate = (_card: Card) => true
        break
      case 'ACTIVE':
        predicate = (card: Card) => !card.deleted
        break
      case 'DELETED':
        predicate = (card: Card) => card.deleted
        break
      case 'SEARCH':
        predicate = (card: Card) => card.isSearched
        break
      default:
        predicate = (_card: Card) => true
        break
    }
    const result = items.filter(predicate)
    return result
  },
)
