export enum StorageKey {
  cards = 'cards',
  versions = 'versions',
  userState = 'userState',
  userSettings = 'userSettings',
}

export enum DBError {
  noData = 'No data in db.',
  decryptError = 'Error while decrypting data.',
  dataFormatError = 'Data format error.',
  errorWhileSettingData = 'Error while setting data to db.',
  keyOrValueIsNotDefined = 'Key or value is not defined.',
}
