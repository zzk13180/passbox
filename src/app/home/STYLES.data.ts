import { lyl, ThemeVariables, ThemeRef } from '@alyle/ui'
import { STYLES as EXPANSION_STYLES } from '@alyle/ui/expansion'

export const STYLES = (theme: ThemeVariables, ref: ThemeRef) => {
  const expansion = ref.selectorsOf(EXPANSION_STYLES)
  return {
    $name: 'home-panel',
    title: () => lyl`{
      margin: 0
      width: 100%
      height: 54px
      line-height: 54px
      position: relative
      top: 0
      left: 0
      &>span {
        width: calc(100% - 20px)
        text-indent: 20px
        cursor: pointer
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
      }
    }`,
    panel: () => lyl`{
      ${expansion.panelHeader} {
        height: 54px
        width: 100vw
        margin-right: calc(100% - 100vw)
        padding: 0
      }
      &::after {
        transition: border ${theme.animations.durations.entering}ms ${theme.animations.curves.standard}
        content: ''
        position: absolute
        top: 0
        bottom: 0
        ${theme.before}: 0
        border-${theme.before}: 2px solid transparent
      }
      ly-icon {
       cursor: pointer
       user-select: none
      }
    }`,
    accordion: () => {
      return lyl`{
        ${expansion.expanded} {
          ${expansion.panelHeader} {
            height: 54px
          }
          &${expansion.panel} {
            &::after {
              border-${theme.before}: 2px solid ${theme.primary.default}
            }
          }
          ${expansion.panelHeader} ${expansion.panelTitle} {
            color: ${theme.primary.default}
          }
        }
        ${expansion.panelBody} {
          padding: 0
          width: 100vw
          margin-right: calc(100% - 100vw)
        }
      }`
    },
    dialog: lyl`{
      width: 100vw
      height: 100vh
      border-radius: 0
    }`,
  }
}
