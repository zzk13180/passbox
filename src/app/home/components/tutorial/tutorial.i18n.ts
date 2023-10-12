import { i18nLanguageIndexMap as indexMap } from 'src/app/services'
import type { I18nLanguageEnum } from 'src/app/services'

export class I18nText {
  currentLanguage: I18nLanguageEnum
  constructor() {}

  get welcome(): string {
    const data = [
      'Welcome',
      '欢迎',
      'ようこそ',
      '¡Bienvenido',
      'Willkommen',
      'Добро пожаловать',
      'Bienvenue',
      'Benvenuto',
      'Bem-vindo',
      'Witaj',
      'مرحبا',
      'خوش آمدید',
      'Selamat datang',
      'Welkom',
    ]
    return data[indexMap[this.currentLanguage]]
  }

  get please(): string {
    const data = [
      'Please choose your preferred language.',
      '请选择您的首选语言。',
      'ご希望の言語を選択してください。',
      'Por favor, elige tu idioma preferido.',
      'Bitte wählen Sie Ihre bevorzugte Sprache aus.',
      'Пожалуйста, выберите язык.',
      'Veuillez choisir votre langue préférée.',
      'Scegli la tua lingua preferita.',
      'Por favor, escolha seu idioma preferido.',
      'Proszę wybrać preferowany język.',
      'الرجاء اختيار لغتك المفضلة.',
      'لطفا زبان مورد علاقه خود را انتخاب کنید.',
      'Silakan pilih bahasa utama Anda.',
      'Kies alsjeblieft uw voorkeurstaal.',
    ]
    return data[indexMap[this.currentLanguage]]
  }
}
