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

  #please: { [key in I18nLanguageEnum]: string } = {
    English: 'Please choose your preferred language.',
    Chinese: '请选择您的首选语言。',
    Japanese: 'ご希望の言語を選択してください。',
    Spanish: 'Por favor, elige tu idioma preferido.',
    German: 'Bitte wählen Sie Ihre bevorzugte Sprache.',
    Russian: 'Пожалуйста, выберите язык.',
    French: 'Veuillez choisir votre langue préférée.',
    Italian: 'Scegli la tua lingua preferita.',
    Portuguese: 'Por favor, escolha seu idioma preferido.',
    Polish: 'Proszę wybrać preferowany język.',
    Arabic: 'الرجاء اختيار لغتك المفضلة.',
    Persian: 'لطفا زبان مورد علاقه خود را انتخاب کنید.',
    Indonesian: 'Silakan pilih bahasa utama Anda.',
    Dutch: 'Kies alsjeblieft uw voorkeurstaal.',
  }

  get please(): string {
    return this.#please[this.currentLanguage]
  }
}
