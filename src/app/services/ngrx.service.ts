import {
  createReducer,
  on,
  Action,
  createAction,
  props,
  createSelector,
} from '@ngrx/store'
import { Card, CardState } from '../models'

// actions
export const initCards = createAction(
  '[Card List] InitCards',
  props<{ cards: Array<Card> }>(),
)
export const add = createAction('[Card List] AddItem', props<{ cards: Card[] }>())
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

// reducers
export const initialState: CardState = {
  term: '',
  items: [],
  deletedItems: [],
  filter: 'ACTIVE',
}
export function cardReducer(state: CardState, action: Action) {
  const _reducer = createReducer(
    initialState,
    on(initCards, (state, { cards }) => ({
      ...state,
      items: [...cards],
    })),
    on(add, (state, { cards }) => ({
      ...state,
      items: [...cards, ...state.items],
    })),
    on(modify, (state, { card }) => ({
      ...state,
      items: state.items.map((item: Card) =>
        item.id === card.id ? { ...item, ...card } : item,
      ),
    })),
    on(remove, (state, { card }) => ({
      ...state,
      items: state.items.filter((item: Card) => item.id !== card.id),
      deletedItems: state.deletedItems.some((item: Card) => item.id === card.id)
        ? state.deletedItems.filter((item: Card) => item.id !== card.id)
        : [...state.deletedItems, card],
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
      term,
    })),
  )
  return _reducer(state, action)
}

const searchHandler = (term: string, card: Card) => {
  const termLower = term.toLowerCase()
  const sysname = card.sysname.toLowerCase()
  const username = card.username.toLowerCase()
  const password = card.password.toLowerCase()
  const sysnameMatch = sysname.includes(termLower)
  const usernameMatch = username.includes(termLower)
  const passwordMatch = password.includes(termLower)
  return sysnameMatch || usernameMatch || passwordMatch
}

// selectors
export const selectCards = createSelector(
  (state: CardState) => state.items,
  (state: CardState) => state.deletedItems,
  (state: CardState) => state.filter,
  (state: CardState) => state.term,
  (items, deletedItems, filter, term) => {
    console.log('selectCards', items, deletedItems, filter, term)
    let result: Card[] = items
    switch (filter) {
      case 'ALL':
        result = [...items, ...deletedItems]
        break
      case 'ACTIVE':
        // result = items
        break
      case 'DELETED':
        result = deletedItems
        break
      default:
        break
    }
    if (result && term) {
      result = result.filter((card: Card) => searchHandler(term, card))
    }
    return result
  },
)
