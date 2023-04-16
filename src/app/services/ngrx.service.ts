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
    if (filter === 'ALL') {
      return items
    } else {
      const predicate = filter === 'ACTIVE' ? t => !t.deleted : t => t.deleted
      return items.filter(predicate)
    }
  },
)
