export enum StorageKey {
  cards = 'cards',
  userState = 'userState',
}

export enum DBError {
  noData = 'No data in db',
  errorWhileGettingData = 'Error while getting data from db',
  errorWhileSettingData = 'Error while setting data to db',
  keyOrValueIsNotDefined = 'Key or value is not defined',
}
