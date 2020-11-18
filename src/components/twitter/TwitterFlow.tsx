import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { useAttestCallBack } from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { LoadingView, SubmittedView } from '../ModalViews'
import { fetchLatestTweet, LatestTweetResponse } from '../../data/social'
import { Dots } from '../../theme/components'

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

  const tweetCopy = `Announcing myself as a delegate on UNI governance. Address:${account}. Signature:${signedMessage ??
    ''}`

  // twitter watcher
  const [watcher, setWatcher] = useState<NodeJS.Timeout | undefined>()
  const [tweetError, setTweetError] = useState<string | undefined>()

  function resetTweetWatcher() {
    if (watcher) {
      clearInterval(watcher)
    }
    setWatcher(undefined)
    setTweetID(undefined)
  }

  // start watching and open window
  function checkForTweet() {
    window.open('https://twitter.com/intent/tweet?text=' + tweetCopy)
    const watcher = setInterval(function() {
      if (twitterHandle) {
        fetchLatestTweet(twitterHandle).then((res: LatestTweetResponse | null) => {
          console.log('fetching latest tweet ')
          if (res?.data[0]) {
            const tweetData = res?.data?.[0]

            // @TODO add regex for format check
            const passedRegex = tweetData.text === tweetCopy
            if (passedRegex) {
              setTweetID(tweetData.id)
            } else {
              resetTweetWatcher()
              setTweetError('Tweet format incorrect, try again with exact message.')
            }
          } else {
            resetTweetWatcher()
            setTweetError('Tweet not found, try again')
          }
        })
      }
    }, 6000)
    setWatcher(watcher)
  }

  // reset watcher if tweet found
  useEffect(() => {
    if (tweetID && watcher) {
      clearInterval(watcher)
    }
  }, [tweetID, watcher])

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
          <ButtonPrimary onClick={checkForTweet}>
            {watcher ? <Dots>Looking for tweet</Dots> : 'Tweet This'}
          </ButtonPrimary>
          {tweetError && <TYPE.error error={true}>{tweetError}</TYPE.error>}
        </AutoColumn>
      ) : (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <BackArrowSimple onClick={resetTweetWatcher} />
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
