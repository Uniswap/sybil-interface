import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../components/Column'
import { ButtonSecondary } from '../components/Button'
import { RowBetween } from '../components/Row'
import { TYPE } from '../theme'
import { useActiveWeb3React } from '../hooks'
import { shortenAddress } from '../utils'
import Input from '../components/NumericalInput'
import styled from 'styled-components'
import { ethers, utils } from 'ethers'

const StyledInput = styled.input<{ error?: boolean; fontSize?: string; align?: string }>`
  color: ${({ error, theme }) => (error ? theme.red1 : theme.text1)};
  width: 0;
  position: relative;
  font-weight: 500;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background-color: ${({ theme }) => theme.bg1};
  font-size: ${({ fontSize }) => fontSize ?? '24px'};
  text-align: ${({ align }) => align && align};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0px;
  -webkit-appearance: textfield;

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }

  ::placeholder {
    color: ${({ theme }) => theme.text4};
  }
`

export default function Home() {
  const [validated, setValidated] = useState(false)
  const { account, library } = useActiveWeb3React()
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  const [typedVal, setTypedVal] = useState('')
  const [tweetId, setTweetId] = useState()

  async function signMessage() {
    if (!library && account) {
      return
    }
    const message = 'Im verifying myself'
    const signed = await library?.getSigner().signMessage(message)

    if (signed) {
      setSignedMessage(signed)
    }
  }

  async function verify() {
    if (!library || !signedMessage) {
      return
    }

    const sig = ethers.utils.splitSignature(signedMessage)
    console.log(sig)
  }

  return (
    <AutoColumn gap="md">
      <RowBetween>
        <TYPE.main>1. </TYPE.main>
        <ButtonSecondary onClick={signMessage}>Sign Message</ButtonSecondary>
      </RowBetween>
      <RowBetween>
        <TYPE.main>2. </TYPE.main>
        <a
          className="twitter-share-button"
          href={'https://twitter.com/intent/tweet?text=' + 'my message is /message/' + signedMessage}
        >
          Tweet
        </a>
      </RowBetween>
      <input
        value={typedVal}
        onChange={e => setTypedVal(e.target.value)}
        placeholder={'enter tweet id (replace with regex)'}
      />
      <RowBetween>
        <TYPE.main>3. </TYPE.main>
        <ButtonSecondary onClick={verify}>Verify</ButtonSecondary>
      </RowBetween>
      <RowBetween>
        <TYPE.main>Address: </TYPE.main>
        <TYPE.main>{shortenAddress(account ?? '')}</TYPE.main>
      </RowBetween>
      <RowBetween>
        <TYPE.main>Validated: </TYPE.main>
        <TYPE.main>{validated ? 'yes' : 'no'}</TYPE.main>
      </RowBetween>
    </AutoColumn>
  )
}
