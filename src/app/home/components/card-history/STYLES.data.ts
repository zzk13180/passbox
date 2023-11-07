import { dot, lyl, shadowBuilder, ThemeVariables, ThemeRef } from '@alyle/ui'
import { STYLES as EXPANSION_STYLES } from '@alyle/ui/expansion'

export const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  const expansion = ref.selectorsOf(EXPANSION_STYLES)
  const { before, after, shadow } = theme
  return {
    expansion: () => lyl`{
      ${expansion.panel} {
        &::after {
          transition: border ${theme.animations.durations.entering}ms ${
            theme.animations.curves.standard
          }
          content: ''
          position: absolute
          top: 0
          bottom: 0
          ${before}: 0
          border-${before}: 2px solid transparent
        }
      }
      ${expansion.panelHeader} {
        height: 54px
      }
      ${expansion.panelTitle} {
        font-weight: 500
      }

      ${expansion.expanded} {
        ${expansion.panelHeader} {
          height: 64px
        }
        &${expansion.panel} {
          background: ${theme.background.secondary}
          &::after {
            border-${before}: 2px solid ${theme.primary.default}
          }
        }
        ${expansion.panelHeader} ${expansion.panelTitle} {
          color: ${theme.primary.default}
        }
      }
      table {
        width: 100%
        box-shadow: ${shadowBuilder(8, shadow)}
      }
      ${dot('ly-column-title')} {
        padding-${after}: 24px
        text-align: center
      }
      ${dot('ly-column-description')} {
        padding-${after}: 12px
        text-align: center
      }
    }`,
  }
}
