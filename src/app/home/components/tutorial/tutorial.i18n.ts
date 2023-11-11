import { Injectable } from '@angular/core'
import type { I18nLanguageEnum } from 'src/app/enums'

@Injectable()
export class I18nText {
  currentLanguage: I18nLanguageEnum
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
    English: 'This is a statement.',
    Chinese: '这是一个声明。',
    Japanese: 'これは声明です。',
    Spanish: 'Esta es una declaración.',
    German: 'Dies ist eine Erklärung.',
    Russian: 'Это заявление.',
    French: 'Ceci est une déclaration.',
    Italian: 'Questa è una dichiarazione.',
    Portuguese: 'Esta é uma declaração.',
    Polish: 'To jest oświadczenie.',
    Arabic: 'هذا بيان.',
    Persian: 'این یک بیانیه است.',
    Indonesian: 'Ini adalah pernyataan.',
    Dutch: 'Dit is een verklaring.',
  }

  get statement(): string {
    return this.#statement[this.currentLanguage]
  }
}
