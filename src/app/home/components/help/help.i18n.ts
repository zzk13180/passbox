import { i18nLanguageIndexMap as indexMap } from 'src/app/services'
import type { I18nLanguageEnum } from 'src/app/services'

export class I18nText {
  currentLanguage: I18nLanguageEnum
  constructor() {}

  get thanks(): string {
    console.log('this.currentLanguage', this.currentLanguage)
    const data = [
      'Thank you for using my software! Your support means a lot to us.',
      '感谢您使用我的软件！您的支持对我们非常重要。',
      '私のソフトウェアをご利用いただき、ありがとうございます！あなたのサポートは私たちにとって非常に重要です。',
      '¡Gracias por usar mi software! Su apoyo significa mucho para nosotros.',
      'Vielen Dank, dass Sie meine Software verwenden! Ihre Unterstützung bedeutet uns viel.',
      'Спасибо за использование моего программного обеспечения! Ваша поддержка для нас очень важна.',
      "Merci d'utiliser mon logiciel ! Votre soutien signifie beaucoup pour nous.",
      'Grazie per aver utilizzato il mio software! Il vostro supporto significa molto per noi.',
      'Obrigado por usar o meu software! O seu apoio significa muito para nós.',
      'Dziękujemy za korzystanie z naszego oprogramowania! Wasze wsparcie ma dla nas ogromne znaczenie.',
      'شكرًا لاستخدام برامجي! دعمك يعني الكثير بالنسبة لنا.',
      'از استفاده از نرم‌افزار من ممنونیم! حمایت شما برای ما بسیار ارزشمند است.',
      'Terima kasih telah menggunakan perangkat lunak saya! Dukungan Anda sangat berarti bagi kami.',
      'Bedankt voor het gebruik van mijn software! Uw steun betekent veel voor ons.',
    ]
    return data[indexMap[this.currentLanguage]]
  }
}
