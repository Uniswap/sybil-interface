import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { useVerifyCallback, useAllVerifiedHandles, HandleEntry, useTweetWatcher } from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { Dots } from '../../theme/components'
import { useTwitterAccount } from '../../state/user/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'
import TwitterAccountPreview from '../../components/twitter/TwitterAccountPreview'
import TwitterLoginButton from './TwitterLoginButton'
import { OffChainRequestModal } from '../TransactionConfirmationModal'
import { useSignedHandle } from '../../hooks/useSignedHandle'
import { fetchLatestTweet, LatestTweetResponse } from '../../data/social'

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

export default function TwitterFlow({ onDismiss }: { onDismiss: () => void }) {
  const { account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // monitor user inputs
  const [twitterHandle] = useTwitterAccount()
  const [tweetID, setTweetID] = useState<undefined | string>()

  // update verified handles if succesful verification
  const [verifiedHandles, setVerifiedHandles] = useAllVerifiedHandles()

  // monitor if user has signed message, reset if back arrow clicked
  const { sig, signMessage, setSig } = useSignedHandle(twitterHandle)

  // monitor verification attempt
  const { verifyCallback } = useVerifyCallback(tweetID)
  const [attempting, setAttempting] = useState(false)
  const [verified, setVerified] = useState(false)
  const [requestError, setRequestError] = useState<string | undefined>()

  async function onVerify() {
    //reset error and loading state
    setAttempting(true)
    setRequestError(undefined)

    // if callback not returned properly ignore
    if (!verifyCallback || !account || !tweetID) return

    const res = await verifyCallback()

    // if error, display for user, if not update verified handle
    if (res.error || !res.success) {
      setRequestError(res.error)
      setAttempting(false)
    } else if (res.success && twitterHandle) {
      const newVerified: { [address: string]: HandleEntry } = {}
      // new copy of verified list
      verifiedHandles &&
        Object.keys(verifiedHandles).map(address => {
          newVerified[address] = verifiedHandles[address]
          return true
        })
      // reset global list of verified handles to account for new entry
      if (newVerified) {
        newVerified[account] = {
          handle: twitterHandle,
          timestamp: Date.now()
        }
        setVerifiedHandles(newVerified)
      }
      setVerified(true)
    }
  }

  // tweet data
  const tweetHashTag = `${activeProtocol?.token.symbol}governance`
  const tweetCopy = `Verifying identity for ${activeProtocol?.token.symbol} governance - addr:${account} - sig:${sig ??
    ''} `

  // watch for user tweet
  const [tweetError, setTweetError] = useState<string | undefined>()
  const [watch, setWatch] = useState(false)

  // use hook to handle polling
  useTweetWatcher(tweetCopy, twitterHandle, watch, setWatch, setTweetID, setTweetError)

  function startWatching() {
    setWatch(true) // restart watcher
    setTweetError(undefined) // reset error
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetCopy}&hashtags=${tweetHashTag && tweetHashTag}`,
      'tweetWindow',
      'height=400,width=800,top=400px,left=400px'
    )
  }

  // start watching and open window
  function checkForTweet() {
    twitterHandle &&
      fetchLatestTweet(twitterHandle)
        .then((res: LatestTweetResponse | null) => {
          if (res?.data[0]) {
            const tweetData = res?.data?.[0]
            // check that tweet contains correct data
            const passedRegex = tweetData.text.includes(tweetCopy)
            if (passedRegex) {
              setTweetID(tweetData.id)
              setTweetError(undefined)
              setWatch(false)
            } else {
              startWatching()
            }
          } else {
            startWatching()
          }
        })
        .catch(() => {
          startWatching()
        })
  }

  return (
    <ModalContentWrapper>
      {!twitterHandle ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <TYPE.mediumHeader ml="6px">Connect Twitter</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TYPE.black>Sign in with Twitter to link your Ethereum address and Twitter handle.</TYPE.black>
          <TwitterAccountPreview />
          <TwitterLoginButton text="Connect Twitter" />
        </AutoColumn>
      ) : !sig ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <TYPE.mediumHeader ml="6px">Step 1: Sign Message</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TYPE.black>Sign a message that will be used to link your wallet address and Twitter handle.</TYPE.black>
          <TwitterAccountPreview />
          <ButtonPrimary onClick={signMessage}>Sign</ButtonPrimary>
        </AutoColumn>
      ) : !tweetID ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <BackArrowSimple onClick={() => setSig(undefined)} />
              <TYPE.mediumHeader ml="6px">Step 2: Announce</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TwitterAccountPreview />
          <TweetWrapper>{tweetCopy + `#${tweetHashTag}`}</TweetWrapper>
          <ButtonPrimary onClick={checkForTweet}>
            {watch ? <Dots>Looking for tweet</Dots> : tweetError ? 'Check again' : 'Tweet This'}
          </ButtonPrimary>
          {tweetError && <TYPE.error error={true}>{tweetError}</TYPE.error>}
        </AutoColumn>
      ) : !verified && !attempting ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <BackArrowSimple
                onClick={() => {
                  setTweetID(undefined)
                  setRequestError(undefined)
                  setWatch(false)
                }}
              />
              <TYPE.mediumHeader ml="6px">Step 3: Submit</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TwitterAccountPreview />
          <Tweet tweetId={tweetID} />
          <TYPE.black>Verify your tweet and add your handle to the list of verified mappings.</TYPE.black>
          <ButtonPrimary onClick={onVerify} disabled={!account || !tweetID || !sig}>
            Submit
          </ButtonPrimary>
          {requestError && <TYPE.error error={true}>{requestError}</TYPE.error>}
        </AutoColumn>
      ) : (
        <OffChainRequestModal onDismiss={onDismiss} success={verified} />
      )}
    </ModalContentWrapper>
  )
}
