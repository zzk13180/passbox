import { Injectable } from '@angular/core'
import { I18nLanguageEnum } from 'src/app/enums'

@Injectable()
export class I18nText {
  currentLanguage: I18nLanguageEnum = I18nLanguageEnum.English
  constructor() {}

  #welcome: { [key in I18nLanguageEnum]: string } = {
    English: 'Welcome',
    Chinese: '欢迎',
    Japanese: 'ようこそ',
    Spanish: '¡Bienvenido',
    German: 'Willkommen',
    Russian: 'Добро пожаловать',
    French: 'Bienvenue',
    Italian: 'Benvenuto',
    Portuguese: 'Bem-vindo',
    Polish: 'Witaj',
    Arabic: 'مرحبا',
    Persian: 'خوش آمدید',
    Indonesian: 'Selamat datang',
    Dutch: 'Welkom',
  }

  get welcome(): string {
    return this.#welcome[this.currentLanguage]
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

  #statement: { [key in I18nLanguageEnum]: string } = {
    English: 'I used AI to translate. Please let me know if you find any errors.',
    Chinese: '我使用人工智能进行翻译。如果您发现任何错误，请告诉我。',
    Japanese: '私はAIを使用して翻訳しました。エラーがあればお知らせください。',
    Spanish:
      'Usé inteligencia artificial para traducir. Por favor, avísame si encuentras algún error.',
    German:
      'Ich habe KI verwendet, um zu übersetzen. Lass es mich wissen, wenn du Fehler findest.',
    Russian:
      'Я использовал искусственный интеллект для перевода. Пожалуйста, сообщите мне, если вы найдете ошибки.',
    French:
      "J'ai utilisé l'IA pour traduire. Veuillez me faire savoir si vous trouvez des erreurs.",
    Italian: "Ho usato l'IA per tradurre. Fammi sapere se trovi degli errori.",
    Portuguese:
      'Eu usei a IA para traduzir. Por favor, me avise se encontrar algum erro.',
    Polish:
      'Użyłem sztucznej inteligencji do tłumaczenia. Proszę daj mi znać, jeśli znajdziesz jakiekolwiek błędy.',
    Arabic: 'لقد استخدمت الذكاء الاصطناعي للترجمة. يرجى إخباري إذا وجدت أي أخطاء.',
    Persian:
      'من از هوش مصنوعی برای ترجمه استفاده کردم. لطفاً به من اطلاع دهید اگر هر گونه اشتباهی پیدا کردید.',
    Indonesian:
      'Saya menggunakan kecerdasan buatan untuk menerjemahkan. Tolong beri tahu saya jika Anda menemukan kesalahan.',
    Dutch: 'Ik heb AI gebruikt om te vertalen. Laat me weten als je fouten vindt.',
  }

  get statement(): string {
    return this.#statement[this.currentLanguage]
  }
}
