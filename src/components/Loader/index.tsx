import React from 'react'

import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const StyledSVG = styled.svg<{ size: string; stroke?: string }>`
  animation: 2s ${rotate} linear infinite;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  path {
    stroke: ${({ stroke, theme }) => stroke ?? theme.primary1};
  }
`

const StyledSVGSecondary = styled.svg<{ size: string; stroke?: string }>`
  animation: 2s ${rotate} linear infinite;
  height: ${({ size }) => size};
  width: ${({ size }) => size};
  path {
    stroke: ${({ stroke, theme }) => stroke ?? theme.yellow2};
  }
`

/**
 * Takes in custom size and stroke for circle color, default to primary color as fill,
 * need ...rest for layered styles on top
 */
export default function Loader({
  size = '16px',
  stroke,
  ...rest
}: {
  size?: string
  stroke?: string
  [k: string]: any
}): JSX.Element {
  return (
    <StyledSVG viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" size={size} stroke={stroke} {...rest}>
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSVG>
  )
}

export function LoaderSecondary({
  size = '16px',
  stroke,
  ...rest
}: {
  size?: string
  stroke?: string
  [k: string]: any
}): JSX.Element {
  return (
    <StyledSVGSecondary
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      size={size}
      stroke={stroke}
      {...rest}
    >
      <path
        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StyledSVGSecondary>
  )
}

const loadingAnimation = keyframes`
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

export const LoadingRows = styled.div`
  display: grid;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);
  & > div {
    animation: ${loadingAnimation} 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      ${({ theme }) => theme.bg2} 25%,
      ${({ theme }) => theme.bg3} 50%,
      ${({ theme }) => theme.bg2} 75%
    );
    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }
  & > div:nth-child(3n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(3n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`
