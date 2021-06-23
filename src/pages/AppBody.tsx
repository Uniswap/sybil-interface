import styled from 'styled-components'

export const BodyWrapper = styled.div`
  position: relative;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-left: 70px;
    width: calc(100% - 102px);
  `};

  @media (max-width: 1080px) {
    width: 100%;
    margin: 0;
  }
`

export const MediumHeaderWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: initial;
  `};
`
