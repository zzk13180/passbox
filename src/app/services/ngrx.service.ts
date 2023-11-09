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

export const getSettings = createAction('[Settings] Get The Settings From DB')
export const resetSettings = createAction('[Settings] Reset The Settings')
export const initSettings = createAction(
  '[Settings] InitSettings',
  props<{ settings: SettingsState }>(),
)
export const updateIsFirstTimeLogin = createAction(
  '[Settings] Update Is First Time Login',
  props<{ isFirstTimeLogin: boolean }>(),
)
export const updateLanguage = createAction(
  '[Settings] Update Language',
  props<{ language: I18nLanguageEnum }>(),
)

export const getCards = createAction('[Card List] Get The Cards From DB')
export const resetCards = createAction('[Card List] Reset The Cards')
export const initCards = createAction(
  '[Card List] Init The Cards',
  props<{ theCards: CardState }>(),
)
export const addInitCards = createAction(
  '[Card List] Add Init Items',
  props<{ cards: Omit<Card, 'id'>[] }>(),
)
export const add = createAction(
  '[Card List] Add Items',
  props<{ cards: Omit<Card, 'id'>[] }>(),
)
export const modify = createAction('[Card List] Modify Item', props<{ card: Card }>())
export const deleteCard = createAction('[Card List] Delete Item', props<{ card: Card }>())
export const permanentlyDeleteCard = createAction(
  '[Card List] Permanently Delete Item',
  props<{ card: Card }>(),
)
export const sort = createAction(
  '[Card List] Sort',
  props<{ previousIndex: number; currentIndex: number }>(),
)
export const search = createAction('[Card List] Search', props<{ term: string }>())
export const restore = createAction('[Card List] Restore', props<{ card: Card }>())

const initialSettingsState: SettingsState = {
  isFirstTimeLogin: false,
  needRecordVersions: true,
  currentLang: I18nLanguageEnum.English,
  KeyboardShortcutsBindings: [],
}
export function settingsReducer(state: SettingsState, action: Action) {
  const _reducer = createReducer(
    initialSettingsState,
    on(initSettings, (_state, { settings }) => settings),
    on(updateIsFirstTimeLogin, (state, { isFirstTimeLogin }) => ({
      ...state,
      isFirstTimeLogin,
    })),
    on(updateLanguage, (state, { language }) => ({ ...state, currentLang: language })),
  )
  return _reducer(state, action)
}

const settingsSelector = createFeatureSelector<SettingsState>('theSettings')

export const selectIsFirstTimeLogin = createSelector(
  settingsSelector,
  (state: SettingsState) => state.isFirstTimeLogin,
)

export const selectNeedRecordVersions = createSelector(
  settingsSelector,
  (state: SettingsState) => state.needRecordVersions,
)

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
    on(addInitCards, (state, { cards }) => ({
      ...state,
      items: [...cards.map(item => ({ ...item, id: uuid() })), ...state.items],
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
    on(deleteCard, (state, { card }) => ({
      ...state,
      items: state.items.filter((item: Card) => item.id !== card.id),
      deletedItems: [card, ...state.deletedItems],
    })),
    on(permanentlyDeleteCard, (state, { card }) => ({
      ...state,
      deletedItems: state.deletedItems.filter((item: Card) => item.id !== card.id),
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
