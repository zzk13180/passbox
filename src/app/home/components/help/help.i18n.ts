import { Injectable } from '@angular/core'
import { I18nLanguageEnum } from 'src/app/enums'

@Injectable()
export class I18nText {
  currentLanguage: I18nLanguageEnum = I18nLanguageEnum.English
  constructor() {}

  #thanks: { [key in I18nLanguageEnum]: string } = {
    English: 'Thank you for using my software! Your support means a lot to us.',
    Chinese: '感谢您使用我的软件！您的支持对我们非常重要。',
    Japanese:
      '私のソフトウェアをご利用いただき、ありがとうございます！あなたのサポートは私たちにとって非常に重要です。',
    Spanish: '¡Gracias por usar mi software! Su apoyo significa mucho para nosotros.',
    German:
      'Vielen Dank, dass Sie meine Software verwenden! Ihre Unterstützung bedeutet uns viel.',
    Russian:
      'Спасибо за использование моего программного обеспечения! Ваша поддержка для нас очень важна.',
    French: "Merci d'utiliser mon logiciel ! Votre soutien signifie beaucoup pour nous.",
    Italian:
      'Grazie per aver utilizzato il mio software! Il vostro supporto significa molto per noi.',
    Portuguese: 'Obrigado por usar o meu software! O seu apoio significa muito para nós.',
    Polish:
      'Dziękujemy za korzystanie z naszego oprogramowania! Wasze wsparcie ma dla nas ogromne znaczenie.',
    Arabic: 'شكرًا لاستخدام برامجي! دعمك يعني الكثير بالنسبة لنا.',
    Persian: 'از استفاده از نرم‌افزار من ممنونیم! حمایت شما برای ما بسیار ارزشمند است.',
    Indonesian:
      'Terima kasih telah menggunakan perangkat lunak saya! Dukungan Anda sangat berarti bagi kami.',
    Dutch: 'Bedankt voor het gebruik van mijn software! Uw steun betekent veel voor ons.',
  }

  get thanks(): string {
    return this.#thanks[this.currentLanguage]
  }
}
