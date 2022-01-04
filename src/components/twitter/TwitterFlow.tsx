import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { useVerifyCallback, useAllVerifiedHandles, useTweetWatcher, useAllIdentities } from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { Dots } from '../../theme/components'
import { useTwitterAccount } from '../../state/user/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'
import TwitterAccountPreview from '../../components/twitter/TwitterAccountPreview'
import TwitterLoginButton from './TwitterLoginButton'
import { OffChainRequestModal } from '../TransactionConfirmationModal'
import { useSignedHandle } from '../../hooks/useSignedHandle'
import { fetchLatestTweet, LatestTweetResponse } from '../../data/social'
import { Identities } from '../../state/social/reducer'
import { CONNECT_CONFIG } from 'state/governance/reducer'

const ModalContentWrapper = styled.div`
  padding: 2rem;
  width: 100%;
  overflow-y: scroll;
`

const TweetWrapper = styled.div`
  padding: 1rem;
  color: ${({ theme }) => theme.blue1};
  background: #f2f2f2;
  word-break: break-word;
`

export default function TwitterFlow({ onDismiss }: { onDismiss: () => void }) {
  const { account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // monitor user inputs
  const [twitterHandle] = useTwitterAccount()
  const [tweetID, setTweetID] = useState<undefined | string>()

  // update verified handles if succesful verification
  const verifiedHandles = useAllVerifiedHandles()
  const [allIndentities, setAllIdentities] = useAllIdentities()

  // monitor if user has signed message, reset if back arrow clicked
  const { sig, signMessage, setSig, error: sigError } = useSignedHandle(twitterHandle)

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
      const newVerified: Identities = {}
      // new copy of verified list
      verifiedHandles &&
        allIndentities &&
        Object.keys(verifiedHandles).map((address) => {
          newVerified[address] = allIndentities[address]
          return true
        })
      // reset global list of verified handles to account for new entry
      if (newVerified && allIndentities) {
        newVerified[account] = {
          ...allIndentities[account],
          twitter: {
            handle: twitterHandle,
            timestamp: Date.now(),
          },
        }
        setAllIdentities(newVerified)
      }
      setVerified(true)
    }
  }

  // tweet data
  const tweetCopyForLink = `${activeProtocol?.emoji ? `${activeProtocol?.emoji} ` : ''}Verifying myself as a ${
    activeProtocol?.social
  } ${
    activeProtocol?.id == CONNECT_CONFIG.id ? 'user' : `%23${activeProtocol?.token?.symbol}Delegate`
  } on Sybil🏛️%0A%0Asybil.org%2F%23%2Fdelegates/${activeProtocol?.id}/${account}%0A%0Aaddr:${account}%0A%0Asig:${
    sig ?? ''
  }`

  // used just for display in UI
  const readableTweetCopy = `${activeProtocol?.emoji ?? ''}Verifying myself as a ${activeProtocol?.social} ${
    activeProtocol?.id == CONNECT_CONFIG.id ? 'user' : `%23${activeProtocol?.token?.symbol}Delegate`
  } on Sybil🏛\n sybil.org/#/delegates/${activeProtocol?.id}/${account} \n addr:${account} \n sig:${sig ?? ''}`

  // watch for user tweet
  const [tweetError, setTweetError] = useState<string | undefined>()
  const [watch, setWatch] = useState<boolean>(false)

  // use hook to handle polling
  useTweetWatcher(sig, twitterHandle, watch, setWatch, setTweetID, setTweetError)

  function startWatching() {
    setWatch(true) // restart watcher
    setTweetError(undefined) // reset error
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetCopyForLink}`,
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
            const passedRegex = tweetData.text.includes('sig:' + sig)
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
          <TYPE.black>
            Sign and tweet a message that will be used to link your wallet address and Twitter handle.
          </TYPE.black>
          <TwitterAccountPreview />
          <ButtonPrimary onClick={signMessage}>Sign</ButtonPrimary>
          {sigError && <TYPE.error error={true}>{sigError}</TYPE.error>}
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
          <TweetWrapper>{readableTweetCopy}</TweetWrapper>
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
