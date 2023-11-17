import { STYLES as FIELD_STYLE } from '@alyle/ui/field'
import { lyl, ThemeVariables, ThemeRef } from '@alyle/ui'

export const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  const expansion = ref.selectorsOf(FIELD_STYLE)
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
