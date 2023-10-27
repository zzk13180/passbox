import { Injectable, Optional, Inject, SecurityContext } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { Observable } from 'rxjs'
import { LyClasses, LyTheme2 } from '@alyle/ui'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser'
import { SVG_ICONS } from './svg-icons.data'

const STYLE_PRIORITY = -2

export interface FontClassOptions {
  key: string
  /** Class name */
  class?: string
  /** Frefix class */
  prefix?: string
}

/** The following styles will never be updated */
const styles = {
  svg: {
    width: 'inherit',
    height: 'inherit',
    fill: 'currentColor',
  },
}

export interface SvgIcon {
  obs?: Observable<SVGElement>
  svg?: SVGElement
}

@Injectable({
  providedIn: 'root',
})
export class LyIconService {
  private _defaultClass?: string = 'material-icons'
  private _defaultClassPrefix?: string
  private svgMap = new Map<string, SvgIcon>()
  private _fontClasses = new Map<string, FontClassOptions>()
  /**
   * Styles
   * @docs-private
   */
  readonly classes: LyClasses<typeof styles>
  readonly defaultSvgIcon: string
  get defaultClass() {
    return this._defaultClass
  }

  get defaultClassPrefix() {
    return this._defaultClassPrefix
  }

  constructor(
    private _sanitizer: DomSanitizer,
    @Optional() @Inject(DOCUMENT) private _document: Document,
    private theme: LyTheme2,
  ) {
    this.classes = this.theme.addStyleSheet(styles, STYLE_PRIORITY)
    for (const [name, svg] of SVG_ICONS) {
      this.addSvgIconLiteral(name, this._sanitizer.bypassSecurityTrustHtml(svg))
    }
    this.defaultSvgIcon =
      '<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10"></circle></svg>'
  }

  addSvgIconLiteral(key: string, literal: SafeHtml) {
    const sanitizedLiteral = this._sanitizer.sanitize(SecurityContext.HTML, literal)
    if (!sanitizedLiteral) {
      throw new Error(`LyIconService: Failed sanitize '${key}'`)
    }
    const svg = this._textToSvg(sanitizedLiteral)
    this.svgMap.set(key, {
      svg,
    })
  }

  /** String to SVG */
  _textToSvg(str: string): SVGElement {
    const div = this._document.createElement('DIV')
    div.innerHTML = str
    const svg = div.querySelector('svg') as SVGElement
    return svg
  }

  getSvg(key: string): SvgIcon {
    if (!this.svgMap.has(key)) {
      throw new Error(`LyIconService: Icon ${key} not found`)
    }
    return this.svgMap.get(key)!
  }

  /**
   * Set default className for `ly-icon`
   * @param className class name
   * @param prefix Class prefix,
   * For example if you use FontAwesome your prefix would be `fa-`,
   * then in the template it is no longer necessary to use the prefix
   * Example: `<ly-icon fontIcon="alarm">`
   */
  setDefaultClass(className?: string, prefix?: string) {
    this._defaultClass = className
    this._defaultClassPrefix = prefix
  }

  /**
   * Register new font class alias
   * demo:
   * For FontAwesome
   * registerFontClass({
   *   key: 'fa',
   *   class: 'fa'
   *   prefix: 'fa-'
   * })
   */
  registerFontClass(opt: FontClassOptions) {
    this._fontClasses.set(opt.key, opt)
  }

  getFontClass(key: string) {
    return this._fontClasses.get(key)
  }
}
