import {
  createReducer,
  on,
  Action,
  createAction,
  props,
  createSelector,
} from '@ngrx/store'
import Fuse from 'fuse.js'
import { v4 as uuid } from 'uuid'
import { moveItemInArray } from '../utils/array.util'
import type { Card, CardState } from '../models'

export const initCards = createAction(
  '[Card List] InitCards',
  props<{ theCards: CardState }>(),
)
export const add = createAction(
  '[Card List] AddItem',
  props<{ cards: Omit<Card, 'id'>[] }>(),
)
export const modify = createAction('[Card List] ModifyItem', props<{ card: Card }>())
export const remove = createAction('[Card List] RemoveItem', props<{ card: Card }>())
export const sort = createAction(
  '[Card List] Sort',
  props<{ previousIndex: number; currentIndex: number }>(),
)
export const search = createAction('[Card List] Search', props<{ term: string }>())
export const restore = createAction('[Card List] Restore', props<{ card: Card }>())

const initialState: CardState = {
  term: '',
  items: [],
  deletedItems: [],
}
export function cardReducer(state: CardState, action: Action) {
  const _reducer = createReducer(
    initialState,
    on(initCards, (_state, { theCards }) => ({
      ...theCards,
      term: '', // reset search term when init
    })),
    on(add, (state, { cards }) => ({
      ...state,
      items: [...cards.map(item => ({ ...item, id: uuid() })), ...state.items],
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
        : [card, ...state.deletedItems],
    })),
    on(sort, (state, { previousIndex, currentIndex }) => {
      const items = [...state.items]
      moveItemInArray(items, previousIndex, currentIndex)
      return { ...state, items }
    }),
    on(search, (state, { term }) => ({
      ...state,
      term,
    })),
    on(restore, (state, { card }) => ({
      ...state,
      items: [card, ...state.items],
      deletedItems: state.deletedItems.filter((item: Card) => item.id !== card.id),
    })),
  )
  return _reducer(state, action)
}

const searchHandler = (cards: Card[], term: string): Card[] => {
  const fuse = new Fuse(cards, {
    keys: [
      {
        name: 'title',
        weight: 0.7,
      },
      {
        name: 'description',
        weight: 0.5,
      },
      {
        name: 'url',
        weight: 0.3,
      },
    ],
    useExtendedSearch: true,
    threshold: 0.4,
    ignoreLocation: true,
    sortFn: (a, b) => a.score - b.score,
  })
  const result = fuse.search(term).map(item => item.item)
  return result
}

export const selectCards = createSelector(
  (state: CardState) => state.items,
  (state: CardState) => state.term,
  (items, term) => {
    let result: Card[] = items
    if (term && result?.length) {
      result = searchHandler(result, term)
    }
    return result
  },
)

export const selectDeletedCards = createSelector(
  (state: CardState) => state.deletedItems,
  deletedItems => deletedItems,
)
