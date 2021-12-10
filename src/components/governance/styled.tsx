import styled from 'styled-components'
import { ButtonBlue } from '../Button'

export const WrappedListLogo = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 32px;
    width: 32px;
    margin-right: 8px;
  `};
`

export const RoundedProfileImage = styled.div`
  display: flex;
  justify-content: center;
  height: 40px;
  width: 40px;
  border-radius: 50%;

  & > img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`

const handleColorType = (status?: any, theme?: any) => {
  switch (status) {
    case 'pending':
      return theme.blue1
    case 'active':
      return theme.blue1
    case 'succeeded':
      return theme.green1
    case 'defeated':
      return theme.red1
    case 'queued':
      return theme.text3
    case 'executed':
      return theme.green1
    case 'canceled':
      return theme.text2
    case 'expired':
      return theme.text3
    default:
      return theme.text3
  }
}

export const EmptyWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.text4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

export const ProposalStatus = styled.span<{ status: string }>`
  font-size: 0.825rem;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
`

export const ProposalStatusSmall = styled.span<{ status: string }>`
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.25rem;
  border-radius: 8px;
  color: ${({ status, theme }) => handleColorType(status, theme)};
  border: 1px solid ${({ status, theme }) => handleColorType(status, theme)};
  width: fit-content;
  justify-self: flex-end;
  text-transform: uppercase;
`

export const DelegateButton = styled(ButtonBlue)<{ disabled: boolean }>`
  @media (max-width: 1080px) {
    font-size: 12px;
    margin-top: 0px !important;
  }

  background-color: ${({ disabled, theme }) => disabled && theme.bg3};
  color: ${({ disabled, theme }) => disabled && theme.text2};
`
