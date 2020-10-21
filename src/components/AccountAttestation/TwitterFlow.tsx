import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween } from '../Row'
import styled from 'styled-components'
import TwitterAccountView from './AccountView'
import { useTwitterDataForHandle, fetchLatestTweetByHandle, LatestTweetResponse } from '../../state/attestations/hooks'
import { SYBIL_ADDRESS } from '../../constants'
import { useAttestCallback } from '../../hooks/useAttestCallback'
import { TwitterTweetEmbed } from 'react-twitter-embed'

const TweetWrapper = styled.div`
    padding: 1rem;
    color: ${({ theme }) => theme.blue1}
    background: #F2F2F2;
    word-break: break-word;
`

export default function TwitterFlow({ endFlow }: { endFlow: () => void }) {
  const { account, library, chainId } = useActiveWeb3React()

  // monitor input or login @todo (which one?) for twitter handle
  const [twitterHandle, setTwitterHandle] = useState<string | undefined>()
  const [typedTwitterHandle, setTypedTwitterHandle] = useState('')

  // fetch tweet id either with watcher or manual trigger for last tweet @todo (which one)
  const [tweetID, setTweetID] = useState<undefined | string>()

  // keep track of signed message
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  async function signMessage() {
    if (!library && account) {
      return
    }

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: 'Sybil Verifier',
      version: '1',
      chainId: chainId,
      verifyingContract: SYBIL_ADDRESS //@todo change this
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'handle', type: 'string' }
    ]
    const message = {
      owner: account,
      handle: twitterHandle
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      ?.send('eth_signTypedData_v4', [account, data])
      .catch(error => {
        console.log(error)
      })
      .then(sig => {
        setSignedMessage(sig)
      })
  }

  const profileData = useTwitterDataForHandle(typedTwitterHandle)

  const [tweetError, setTweetError] = useState<string | undefined>()
  function checkForTweet() {
    if (twitterHandle) {
      fetchLatestTweetByHandle(twitterHandle).then((res: LatestTweetResponse | null) => {
        if (res?.data[0]) {
          const tweetData = res?.data?.[0]
          // @TODO add regex for format check
          const passedRegex = true
          if (passedRegex) {
            setTweetID(tweetData.id)
          } else {
            setTweetError('Tweet format incorrect, try again with exact message.')
          }
        } else {
          setTweetError('Tweet not found, try again')
        }
      })
    }
  }

  const tweetCopy = `Announcing myself as a delegate on UNI governance.     
  \n\n
  \n\nAddress:${account}. 
  \n\n   
   Signature:${signedMessage ?? ''}`

  const { attestCallback } = useAttestCallback(tweetID, twitterHandle)

  async function attest() {
    attestCallback().then(() => {
      console.log('sent')
    })
  }

  return !twitterHandle ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>1/5 Enter Twitter handle</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TYPE.black>Enter handle to attest for.</TYPE.black>
      <input
        value={typedTwitterHandle}
        onChange={e => setTypedTwitterHandle(e.target.value)}
        placeholder={'@example'}
      />
      <TwitterAccountView name={profileData?.name} handle={profileData?.handle} imageURL={profileData?.profileURL} />
      <ButtonPrimary onClick={() => setTwitterHandle(typedTwitterHandle)} disabled={!profileData}>
        Next
      </ButtonPrimary>
    </AutoColumn>
  ) : !signedMessage ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>2/5 Sign Message</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TYPE.black>
        Sign a mesage that will be used to veirfy your address on chain. The signature will be derived from the
        following data:{' '}
      </TYPE.black>
      <TweetWrapper>
        <AutoColumn gap="md">
          <TYPE.black>Account: {account ?? ''}</TYPE.black>
          <TYPE.black>Twitter Handle: @{twitterHandle ?? ''}</TYPE.black>
        </AutoColumn>
      </TweetWrapper>
      <ButtonPrimary onClick={signMessage}>Sign</ButtonPrimary>
    </AutoColumn>
  ) : !tweetID ? (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>3/5 Tweet Signature</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TweetWrapper>{tweetCopy}</TweetWrapper>
      <AutoColumn justify="center">
        <ExternalLink href={'https://twitter.com/intent/tweet?text=' + tweetCopy}>Tweet this ↗</ExternalLink>
      </AutoColumn>
      <ButtonPrimary onClick={checkForTweet}>Ive Tweeted</ButtonPrimary>
      {tweetError && <TYPE.error error={true}>{tweetError}</TYPE.error>}
    </AutoColumn>
  ) : (
    <AutoColumn gap="lg">
      <RowBetween>
        <TYPE.mediumHeader>4/4 Verify On Chain</TYPE.mediumHeader>
        <CloseIcon onClick={endFlow} />
      </RowBetween>
      <TwitterTweetEmbed tweetId={tweetID} />
      <TYPE.black>Submit a transaction with your tweet location to be verified on chain.</TYPE.black>
      <ButtonPrimary onClick={attest} disabled={!account || !tweetID || !signedMessage}>
        Verify
      </ButtonPrimary>
    </AutoColumn>
  )
}
