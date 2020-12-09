import { css } from 'styled-components'

import myFontURL from '../assets/fonts/GT-Haptik-Medium.ttf'

export const fontFaces = css`
  @font-face {
    font-family: 'GT Haptik Medium';
    src: url(${myFontURL}) format('woff2');
    font-style: normal;
  }
`
