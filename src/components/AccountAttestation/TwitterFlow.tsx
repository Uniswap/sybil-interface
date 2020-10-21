import React, { useState, ReactNode } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, ExternalLink, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import TwitterAccountView from './AccountView'
import { useTwitterDataForHandle, fetchLatestTweetByHandle, LatestTweetResponse } from '../../state/attestations/hooks'
import { SYBIL_ADDRESS } from '../../constants'
import { useAttestCallback } from '../../hooks/useAttestCallback'
import { Tweet } from 'react-twitter-widgets'
import TransactionConfirmationModal from '../TransactionConfirmationModal'

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

const StyledTextInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.bg3};
  font-size: 1rem;
`

export default function TwitterFlow({ endFlow }: { endFlow: () => void }) {
  const { account, library, chainId } = useActiveWeb3React()

  // monitor input or login @todo (which one?) for twitter handle
  const [twitterHandle, setTwitterHandle] = useState<string | undefined>('testcryptotest')
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

  const [attemptingSubmit, setAttemptingSubmit] = useState(false)
  const [txnHash, setTxnHash] = useState<string | undefined>()

  async function attest() {
    setAttemptingSubmit(true)
    attestCallback()
      .then(hash => {
        setTxnHash(hash)
        setAttemptingSubmit(false)
      })
      .catch(e => {
        console.log(e)
        setAttemptingSubmit(false)
      })
  }

  const twitterModalContent: ReactNode = (
    <ModalContentWrapper>
      {!twitterHandle ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>1/4 Enter Twitter handle</TYPE.mediumHeader>
            <CloseIcon onClick={endFlow} />
          </RowBetween>
          <TYPE.black>This will link this handle with your ethereum address.</TYPE.black>
          <StyledTextInput
            value={typedTwitterHandle}
            onChange={e => setTypedTwitterHandle(e.target.value)}
            placeholder={'@example'}
          />
          <TwitterAccountView
            name={profileData?.name}
            handle={profileData?.handle}
            imageURL={profileData?.profileURL}
          />
          <ButtonPrimary onClick={() => setTwitterHandle(typedTwitterHandle)} disabled={!profileData}>
            Next
          </ButtonPrimary>
        </AutoColumn>
      ) : !signedMessage ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <RowFixed>
              <BackArrowSimple onClick={() => setTwitterHandle(undefined)} />
              <TYPE.mediumHeader ml="6px">2/4 Sign Message</TYPE.mediumHeader>
            </RowFixed>
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
            <RowFixed>
              <BackArrowSimple onClick={() => setSignedMessage(undefined)} />
              <TYPE.mediumHeader ml="6px">3/4 Announce</TYPE.mediumHeader>
            </RowFixed>
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
            <RowFixed>
              <BackArrowSimple onClick={() => setTweetID(undefined)} />
              <TYPE.mediumHeader ml="6px">4/4 Submit</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={endFlow} />
          </RowBetween>
          <Tweet tweetId={tweetID} />
          <TYPE.black>Submit a transaction with your tweet location to be verified on chain.</TYPE.black>
          <ButtonPrimary onClick={attest} disabled={!account || !tweetID || !signedMessage}>
            Submit
          </ButtonPrimary>
        </AutoColumn>
      )}
    </ModalContentWrapper>
  )

  return (
    <TransactionConfirmationModal
      attemptingTxn={attemptingSubmit}
      pendingText="Attempting verification."
      isOpen={true}
      onDismiss={endFlow}
      hash={txnHash}
      content={() => twitterModalContent}
    />
  )
}
