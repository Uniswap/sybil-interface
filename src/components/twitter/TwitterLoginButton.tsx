import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'

export const VerifyButton = styled.a`
  background-color: ${({ theme }) => theme.blue1};
  padding: 4px 16px;
  outline: none;
  border: 1px solid transparent;
  width: fit-content;
  border-radius: 12px;
  white-space: nowrap;
  text-decoration: none;
  font-size: 14px;
  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const TwitterLogo = styled.img`
  height: 24px;
  width: 24px;
`

export default function TwitterLoginButton({ text }: { text: string }) {
  return (
    <VerifyButton href="https://gswf8vje6i.execute-api.us-east-2.amazonaws.com/latest/login/twitter">
      <RowBetween>
        <TYPE.white fontSize="14px">{text}</TYPE.white>
        <TwitterLogo src={TwitterIcon} />
      </RowBetween>
    </VerifyButton>
  )
}
