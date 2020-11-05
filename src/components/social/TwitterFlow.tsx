import React, { useState, useContext } from 'react'
import { AutoColumn, ColumnCenter } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, CloseIcon, ExternalLink, BackArrowSimple } from '../../theme'
import { useActiveWeb3React } from '../../hooks'

import { RowBetween, RowFixed } from '../Row'
import styled, { ThemeContext } from 'styled-components'
import TwitterAccountView from './AccountView'
import {
  LatestTweetResponse,
  useTwitterProfileData,
  fetchLatestTweet,
  useVerifyCallback,
  VerifyResult
} from '../../state/social/hooks'
import { Tweet } from 'react-twitter-widgets'
import { CheckCircle } from 'react-feather'
import { Text } from 'rebass'

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

const Wrapper = styled.div`
  width: 100%;
`
const Section = styled(AutoColumn)`
  padding: 24px;
`

const ConfirmedIcon = styled(ColumnCenter)`
  padding: 60px 0;
`

export default function TwitterFlow({ onDismiss }: { onDismiss: () => void }) {
  const { account, library } = useActiveWeb3React()
  const theme = useContext(ThemeContext)

  // monitor input or login @todo (which one?) for twitter handle
  const [twitterHandle, setTwitterHandle] = useState<string | undefined>()
  const [typedTwitterHandle, setTypedTwitterHandle] = useState('')

  // fetch profile info for display
  const profileData = useTwitterProfileData(typedTwitterHandle)

  // fetch tweet id either with watcher or manual trigger for last tweet @todo (which one)
  const [tweetID, setTweetID] = useState<undefined | string>()

  // keep track of signed message
  const [signedMessage, setSignedMessage] = useState<undefined | string>()

  const { verifyCallback } = useVerifyCallback(tweetID)
  const [requestError, setRequestError] = useState<string | undefined>()
  const [verified, setVerified] = useState<boolean>(false)

  // attempt to verify, display success or fail to user
  async function verify() {
    setRequestError(undefined) // reset error
    const res: VerifyResult = await verifyCallback()
    if (res.success) setVerified(true)
    if (res.error) setRequestError(res.error)
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
      {verified ? (
        <Wrapper>
          <Section>
            <RowBetween>
              <div />
              <CloseIcon onClick={onDismiss} />
            </RowBetween>
            <ConfirmedIcon>
              <CheckCircle strokeWidth={0.5} size={90} color={theme.primary1} />
            </ConfirmedIcon>
            <AutoColumn gap="12px" justify={'center'}>
              <Text fontWeight={500} fontSize={20}>
                Verification Successful
              </Text>
              <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }}>
                <Text fontWeight={500} fontSize={20}>
                  Close
                </Text>
              </ButtonPrimary>
            </AutoColumn>
          </Section>
        </Wrapper>
      ) : !twitterHandle ? (
        <AutoColumn gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>1/4 Enter Twitter handle</TYPE.mediumHeader>
            <CloseIcon onClick={onDismiss} />
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
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <TYPE.black>
            Sign a mesage that will be used to veirfy your address on chain. The signature will be derived from the
            following data:{' '}
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
              <TYPE.mediumHeader ml="6px">3/4 Announce</TYPE.mediumHeader>
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
              <TYPE.mediumHeader ml="6px">4/4 Submit</TYPE.mediumHeader>
            </RowFixed>
            <CloseIcon onClick={onDismiss} />
          </RowBetween>
          <Tweet tweetId={tweetID} />
          <TYPE.black>Submit a transaction with your tweet location to be verified on chain.</TYPE.black>
          <ButtonPrimary onClick={verify} disabled={!account || !tweetID || !signedMessage}>
            Submit
          </ButtonPrimary>
          {requestError && <TYPE.error error={true}>{requestError}</TYPE.error>}
        </AutoColumn>
      )}
    </ModalContentWrapper>
  )
}
