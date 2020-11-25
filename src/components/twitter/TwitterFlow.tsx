import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { useVerifyCallback } from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { fetchLatestTweet, LatestTweetResponse } from '../../data/social'
import { Dots } from '../../theme/components'
import { useTwitterAccount } from '../../state/user/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'
import TwitterAccountPreview from '../../components/twitter/TwitterAccountPreview'
import TwitterLoginButton from './TwitterLoginButton'
import { OffChainRequestModal } from '../TransactionConfirmationModal'

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

export default function TwitterFlow({
  onDismiss,
  setAccountOverride
}: {
  onDismiss: () => void
  setAccountOverride: (account: string) => void
}) {
  const { account, library } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // monitor user inputs
  const [twitterHandle] = useTwitterAccount()
  const [tweetID, setTweetID] = useState<undefined | string>()
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  // monitor on chain submission
  const { verifyCallback } = useVerifyCallback(tweetID)
  const [requestError, setRequestError] = useState<string | undefined>()
  const [verified, setVerified] = useState(false)
  const [attempting, setAttempting] = useState(false)

  async function onVerify() {
    setAttempting(true)
    // if callback not returned properly ignore
    if (!verifyCallback || !account || !tweetID) return
    // try delegation and store hash
    const res = await verifyCallback()

    if (res.error) {
      setRequestError(res.error)
    } else if (res.success && twitterHandle) {
      setAccountOverride(twitterHandle)
      setVerified(true)
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

  const tweetHashTag = `${activeProtocol?.token.symbol}governance`

  const tweetCopy = `Verifying identity for ${
    activeProtocol?.token.symbol
  } governance - addr:${account} - Signature:${signedMessage ?? ''}`

  // twitter watcher
  const [tweetError, setTweetError] = useState<string | undefined>()

  const [watch, setWatch] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (twitterHandle && watch) {
        fetchLatestTweet(twitterHandle).then((res: LatestTweetResponse | null) => {
          console.log('fetching latest tweet ')
          if (res?.data[0]) {
            const tweetData = res?.data?.[0]

            // @TODO add regex for format check
            const passedRegex = tweetData.text.includes(tweetCopy)
            if (passedRegex) {
              setTweetID(tweetData.id)
              setTweetError(undefined)
            } else {
              setWatch(false)
              setTweetError('Tweet not found, try again with exact message.')
            }
          } else {
            setWatch(false)
            setTweetError('Tweet not found, try again')
          }
        })
      }
    }, 6000)
    return () => clearTimeout(timer)
  }, [tweetCopy, twitterHandle, watch])

  // start watching and open window
  function checkForTweet() {
    setTweetError(undefined)
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetCopy}&hashtags=${tweetHashTag && tweetHashTag}`,
      'tweetWindow',
      'height=400,width=800'
    )
    setWatch(true)
  }

  // reset watcher if tweet found
  useEffect(() => {
    if (tweetID && watch) {
      setWatch(false)
    }
  }, [tweetID, watch])

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
          <TYPE.black>Sign in with Twitter to start connecting your identity with your Ethereum address.</TYPE.black>
          <TwitterAccountPreview />
          <TwitterLoginButton text="Connect Twitter" />
        </AutoColumn>
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
            the following data:
          </TYPE.black>
          <TwitterAccountPreview />
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
          <TwitterAccountPreview />

          <TweetWrapper>{tweetCopy + `#${tweetHashTag}`}</TweetWrapper>
          <ButtonPrimary onClick={checkForTweet}>
            {watch ? <Dots>Looking for tweet</Dots> : tweetError ? 'Try again' : 'Tweet This'}
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
              <TYPE.mediumHeader ml="6px">3/3 Submit</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TwitterAccountPreview />
          <Tweet tweetId={tweetID} />
          <TYPE.black>Post your tweet content location on-chain for off-chain verifiers to use.</TYPE.black>
          <ButtonPrimary onClick={onVerify} disabled={!account || !tweetID || !signedMessage}>
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
