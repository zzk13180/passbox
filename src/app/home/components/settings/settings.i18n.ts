import { Injectable } from '@angular/core'
import { I18nLanguageEnum } from 'src/app/enums'

@Injectable()
export class I18nText {
  currentLanguage: I18nLanguageEnum = I18nLanguageEnum.English
  constructor() {}

  #mainWinAlwaysOnTopLabel: { [key in I18nLanguageEnum]: string } = {
    English: 'Main window always on top',
    Chinese: '主窗口始终置顶',
    Japanese: 'メインウィンドウを常に最前面に表示',
    Spanish: 'Ventana principal siempre visible',
    German: 'Hauptfenster immer im Vordergrund',
    Russian: 'Главное окно всегда сверху',
    French: 'Fenêtre principale toujours visible',
    Italian: 'Finestra principale sempre in primo piano',
    Portuguese: 'Janela principal sempre visível',
    Polish: 'Główne okno zawsze na wierzchu',
    Arabic: 'النافذة الرئيسية دائما مرئية',
    Persian: 'پنجره اصلی همیشه قابل مشاهده است',
    Indonesian: 'Jendela utama selalu terlihat',
    Dutch: 'Hoofdvenster altijd zichtbaar',
  }

  get mainWinAlwaysOnTopLabel(): string {
    return this.#mainWinAlwaysOnTopLabel[this.currentLanguage]
  }

  #openBrowserWinAlwaysOnTopLabel: { [key in I18nLanguageEnum]: string } = {
    English: 'Open browser window always on top',
    Chinese: '浏览器窗口始终置顶',
    Japanese: 'ブラウザウィンドウを常に最前面に表示',
    Spanish: 'Ventana del navegador siempre visible',
    German: 'Browserfenster immer im Vordergrund',
    Russian: 'Окно браузера всегда сверху',
    French: 'Fenêtre du navigateur toujours visible',
    Italian: 'Finestra del browser sempre in primo piano',
    Portuguese: 'Janela do navegador sempre visível',
    Polish: 'Okno przeglądarki zawsze na wierzchu',
    Arabic: 'نافذة المتصفح دائما مرئية',
    Persian: 'پنجره مرورگر همیشه قابل مشاهده است',
    Indonesian: 'Jendela browser selalu terlihat',
    Dutch: 'Browservenster altijd zichtbaar',
  }

  get openBrowserWinAlwaysOnTopLabel(): string {
    return this.#openBrowserWinAlwaysOnTopLabel[this.currentLanguage]
  }

  #doNotRecordHistoricalVersionsLabel: { [key in I18nLanguageEnum]: string } = {
    English: 'Do not record historical versions',
    Chinese: '不记录历史版本',
    Japanese: '履歴バージョンを記録しない',
    Spanish: 'No registrar versiones históricas',
    German: 'Keine historischen Versionen aufzeichnen',
    Russian: 'Не записывать исторические версии',
    French: 'Ne pas enregistrer les versions historiques',
    Italian: 'Non registrare le versioni storiche',
    Portuguese: 'Não registre versões históricas',
    Polish: 'Nie rejestruj wersji historycznych',
    Arabic: 'لا تسجل الإصدارات التاريخية',
    Persian: 'نسخه های تاریخی را ثبت نکنید',
    Indonesian: 'Jangan mencatat versi historis',
    Dutch: 'Historische versies niet opnemen',
  }

  get doNotRecordHistoricalVersionsLabel(): string {
    return this.#doNotRecordHistoricalVersionsLabel[this.currentLanguage]
  }

  #passwordEncryptionStrengthLabel: { [key in I18nLanguageEnum]: string } = {
    English: 'Password encryption strength',
    Chinese: '密码加密强度',
    Japanese: 'パスワードの暗号化強度',
    Spanish: 'Fuerza de cifrado de contraseña',
    German: 'Passwortverschlüsselungsstärke',
    Russian: 'Сила шифрования пароля',
    French: 'Force de chiffrement du mot de passe',
    Italian: 'Forza di crittografia della password',
    Portuguese: 'Força de criptografia de senha',
    Polish: 'Siła szyfrowania hasła',
    Arabic: 'قوة تشفير كلمة المرور',
    Persian: 'قدرت رمزگذاری رمز عبور',
    Indonesian: 'Kekuatan enkripsi kata sandi',
    Dutch: 'Wachtwoordcoderingssterkte',
  }

  get passwordEncryptionStrengthLabel(): string {
    return this.#passwordEncryptionStrengthLabel[this.currentLanguage]
  }
}
