import {
  createReducer,
  on,
  Action,
  createAction,
  props,
  createSelector,
  createFeatureSelector,
} from '@ngrx/store'
import Fuse from 'fuse.js'
import { v4 as uuid } from 'uuid'
import { moveItemInArray } from '../utils/array.util'
import { I18nLanguageEnum } from '../enums'
import type { Card, CardState, SettingsState } from '../models'

export const initSettings = createAction(
  '[Settings] InitSettings',
  props<{ settings: SettingsState }>(),
)
export const updateLanguage = createAction(
  '[Settings] ModifySettings',
  props<{ language: I18nLanguageEnum }>(),
)

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

const initialSettingsState: SettingsState = {
  currentLang: I18nLanguageEnum.English,
}
export function settingsReducer(state: SettingsState, action: Action) {
  const _reducer = createReducer(
    initialSettingsState,
    on(initSettings, (_state, { settings }) => settings),
    on(updateLanguage, (_state, { language }) => ({ ..._state, currentLang: language })),
  )
  return _reducer(state, action)
}

const settingsSelector = createFeatureSelector<SettingsState>('theSettings')

export const selectLanguage = createSelector(
  settingsSelector,
  (state: SettingsState) => state.currentLang,
)

const initialCardState: CardState = {
  term: '',
  items: [],
  deletedItems: [],
}
export function cardReducer(state: CardState, action: Action) {
  const _reducer = createReducer(
    initialCardState,
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
    // TODO removeCard and deleteCard(deletedItems) will make different
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

const fuse = new Fuse([], {
  keys: ['title', 'description', 'secret', 'url'],
  useExtendedSearch: true,
  threshold: 0.4,
  ignoreLocation: true,
  sortFn: (a, b) => a.score - b.score,
})

const searchHandler = (cards: Card[], term: string): Card[] => {
  fuse.setCollection(cards)
  const result = fuse.search(term).map(item => item.item)
  return result
}

const cardSelector = createFeatureSelector<CardState>('theCards')

export const selectCards = createSelector(cardSelector, (state: CardState) => {
  let result: Card[] = state.items
  if (state.term && result?.length) {
    result = searchHandler(result, state.term)
  }
  return result
})

export const selectDeletedCards = createSelector(
  cardSelector,
  (state: CardState) => state.deletedItems,
)
