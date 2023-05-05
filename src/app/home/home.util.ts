import { Card } from '../models'

export function html2cards(html: string): Card[] {
  const cards: Card[] = []
  const placeholder = document.createElement('div')
  placeholder.innerHTML = html
  const atags = placeholder.querySelectorAll('a')
  atags.forEach(atag => {
    const title = atag.innerText ?? ''
    const url = atag.getAttribute('href') ?? ''
    const id = atag.getAttribute('data-id') ?? ''
    if (title && url) {
      const card: Card = {
        title,
        url,
        id,
        description: '',
        secret: '',
      }
      cards.push(card)
    }
  })
  return cards
}
