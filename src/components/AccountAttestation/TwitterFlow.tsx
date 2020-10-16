import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary, ExternalLinkButton } from '../Button'
import { TYPE, CloseIcon } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { ethers } from 'ethers'

const TweetWrapper = styled.div`
    padding: 1rem;
    color: ${({ theme }) => theme.blue1}
    background: #F2F2F2;
    word-break: break-word;
`

export default function TwitterFlow({ endFlow }: { endFlow: () => void }) {
  const { account, library, chainId } = useActiveWeb3React()

  /**
   * @todo
   * replace with some regex and lookup tweet content
   * and show below when pasted
   */
  const [tweetID, setTweetID] = useState<undefined | string>()
  const [hasTweeted, setHasTweeted] = useState(false)
  const [typedVal, setTypedVal] = useState('')

  // keep track of signed message
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  async function signMessage() {
    if (!library && account) {
      return
    }

    // const EIP712Domain = [
    //   { name: 'name', type: 'string' },
    //   { name: 'version', type: 'string' },
    //   { name: 'chainId', type: 'uint256' },
    //   { name: 'verifyingContract', type: 'address' }
    // ]
    // const domain = {
    //   name: 'Uniswap V2',
    //   version: '1',
    //   chainId: chainId,
    //   verifyingContract: '0x6b7bad8b1b1a46e39dbd964d16672c6aa06b6111' //@todo change this
    // }
    // const Permit = [{ name: 'owner', type: 'address' }]
    // const message = {
    //   owner: account
    // }
    // const data = JSON.stringify({
    //   types: {
    //     EIP712Domain,
    //     Permit
    //   },
    //   domain,
    //   primaryType: 'Permit',
    //   message
    // })

    // library
    //   ?.send('eth_signTypedData_v4', [account, data])
    //   .catch(error => {
    //     console.log(error)
    //   })
    //   .then(res => {
    //     console.log(res)
    //     const sig = splitSignature(res)
    //     console.log(sig)
    //     setSignedMessage(res)
    //   })
    library
      ?.getSigner()
      .signMessage('testmessage')
      .then(data => {
        console.log(data)
        console.log(ethers.utils.hexlify(data))
      })
  }

  return !signedMessage ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>1/4 Sign Message</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TYPE.black>Sign a mesage that will be used to veirfy you address on chain.</TYPE.black>
      <ButtonPrimary onClick={signMessage}>Sign</ButtonPrimary>
    </AutoColumn>
  ) : !hasTweeted ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>2/4 Tweet Signature</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>

      <TweetWrapper>{'Sybil attestation signature: ' + signedMessage}</TweetWrapper>
      <ExternalLinkButton
        href={'https://twitter.com/intent/tweet?text=' + signedMessage}
        onClick={() => setHasTweeted(true)}
      >
        Tweet
      </ExternalLinkButton>
    </AutoColumn>
  ) : !tweetID ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>3/4 Tweet Id</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TYPE.black>Enter the id of your tweet (temp)</TYPE.black>
      <input
        value={typedVal}
        onChange={e => setTypedVal(e.target.value)}
        placeholder={'enter tweet id (replace with regex)'}
      />
      <ButtonPrimary onClick={() => setTweetID(typedVal)} disabled={!typedVal}>
        Submit
      </ButtonPrimary>
    </AutoColumn>
  ) : (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>4/4 Verify On Chain</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TYPE.black>Submit a transaction with your tweet location to be verified on chain.</TYPE.black>
      <ButtonPrimary onClick={() => setHasTweeted(true)} disabled={!typedVal}>
        Attest
      </ButtonPrimary>
    </AutoColumn>
  )
}
