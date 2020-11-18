import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, ExternalLink, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { LatestTweetResponse, fetchLatestTweet, useAttestCallBack } from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { LoadingView, SubmittedView } from '../ModalViews'

const ModalContentWrapper = styled.div`
  padding: 2rem;
  width: 100%;
`

const TweetWrapper = styled.div`
    padding: 1rem;
    color: ${({ theme }) => theme.blue1}
    background: #F2F2F2;
    word-break: break-word;
`

export default function TwitterFlow({ twitterHandle, onDismiss }: { twitterHandle: string; onDismiss: () => void }) {
  const { account, library } = useActiveWeb3React()

  // fetch tweet id either with watcher or manual trigger for last tweet @todo (which one)
  const [tweetID, setTweetID] = useState<undefined | string>()

  // keep track of signed message
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  const attestCallback = useAttestCallBack(twitterHandle)
  const [requestError, setRequestError] = useState<string | undefined>()

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onVerify() {
    setAttempting(true)

    // if callback not returned properly ignore
    if (!attestCallback || !account || !tweetID) return

    // try delegation and store hash
    const hash = await attestCallback(account, tweetID)?.catch(error => {
      setAttempting(false)
      setRequestError('Error submitting verification')
      console.log(error)
    })

    if (hash) {
      setAttempting(false)
      setHash(hash)
    }
  }

  async function signMessage() {
    if (!library && account) {
      return
    }

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' }
    ]
    const domain = {
      name: 'Sybil Verifier',
      version: '1'
    }
    const Permit = [{ name: 'handle', type: 'string' }]
    const message = { handle: twitterHandle }
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

  const [tweetError, setTweetError] = useState<string | undefined>()
  function checkForTweet() {
    if (twitterHandle) {
      fetchLatestTweet(twitterHandle).then((res: LatestTweetResponse | null) => {
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

  return (
    <ModalContentWrapper>
      {attempting && !hash ? (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="2rem" justify={'center'}>
            <TYPE.largeHeader>Submitting social data</TYPE.largeHeader>
          </AutoColumn>
        </LoadingView>
      ) : hash ? (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="2rem" justify={'center'}>
            <TYPE.largeHeader>Verification Submitted</TYPE.largeHeader>
            <ButtonPrimary onClick={wrappedOndismiss}>Close</ButtonPrimary>
          </AutoColumn>
        </SubmittedView>
      ) : !signedMessage ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <TYPE.mediumHeader ml="6px">1/3 Sign Message</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TYPE.black>
            Sign a mesage that will be used to link your address with Twitter handle. The signature will be derived from
            the following data:{' '}
          </TYPE.black>
          <TweetWrapper>
            <AutoColumn gap="md">
              <TYPE.black>handle: @{twitterHandle ?? ''}</TYPE.black>
            </AutoColumn>
          </TweetWrapper>
          <ButtonPrimary onClick={signMessage}>Sign</ButtonPrimary>
        </AutoColumn>
      ) : !tweetID ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <BackArrowSimple onClick={() => setSignedMessage(undefined)} />
              <TYPE.mediumHeader ml="6px">2/3 Announce</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
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
            <RowFixed>
              <BackArrowSimple onClick={() => setTweetID(undefined)} />
              <TYPE.mediumHeader ml="6px">3/3 Submit</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <Tweet tweetId={tweetID} />
          <TYPE.black>Post your tweet content location on-chain for off-chain verifiers to use.</TYPE.black>
          <ButtonPrimary onClick={onVerify} disabled={!account || !tweetID || !signedMessage}>
            Submit
          </ButtonPrimary>
          {requestError && <TYPE.error error={true}>{requestError}</TYPE.error>}
        </AutoColumn>
      )}
    </ModalContentWrapper>
  )
}
