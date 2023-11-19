import { STYLES as FIELD_STYLE } from '@alyle/ui/field'
import { lyl, ThemeVariables } from '@alyle/ui'
import type { SelectorsFn } from '@alyle/ui'

export const STYLES = (theme: ThemeVariables, selectors: SelectorsFn) => {
  const expansion = selectors(FIELD_STYLE)
  return {
    $name: 'home-settings',
    root: lyl`{
      ${expansion.infix} {
        height: 50px
        padding: 0
      }
    }`,
    input: lyl`{
      height: 100%
    }`,
  }
}
