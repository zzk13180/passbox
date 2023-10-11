import { lyl, ThemeRef, ThemeVariables } from '@alyle/ui'

export const STYLES = (_theme: ThemeVariables, ref: ThemeRef) => {
  const __ = ref.selectorsOf(STYLES)
  return {
    root: lyl`{
      display: block
    }`,
    intraContainer: lyl`{
      text-align: center
      color: #fff
      display: flex
      justify-content: center
      align-items: center
    }`,
    intraContent: () => lyl`{
      position: relative
      & ${__.buttons} a {
        margin: 8px
      }
      & > p {
        user-select: none
        font-weight: 300
      }
      & > h2 {
        height: 80px
        user-select: none
        letter-spacing: -.05em
        text-shadow: rgba(255, 255, 255, 0.4) 0px 0px 11px
      }
    }`,
    buttons: lyl`{
      button {
        cursor: default
        display: inline-flex
        margin: 8px
        padding: 1em
        font-size: 14px
        text-align: center
        word-break: break-all
        align-items: center
        justify-content: center
      }
    }`,
    canvas: lyl`{
      background-color: #1a0e2d
      width: 100%
      height: 100%
      position: absolute
      left: 0
      top: 0
      user-select: none
      pointer-events: none
    }`,
  }
}

// transform: rotateX(180deg)
