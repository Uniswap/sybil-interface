import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { useToggleModal } from '../../state/application/hooks'
import { useActiveWeb3React } from '../../hooks'
import ReactGA from 'react-ga'
import { ApplicationModal } from '../../state/application/actions'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonBasic, ButtonCustom } from '../Button'
import { useVerifiedHandle } from '../../state/social/hooks'
import { useTwitterAccount } from '../../state/user/hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import Modal from '../Modal'
import TwitterFlow from '../twitter/TwitterFlow'
import TwitterLoginButton from '../twitter/TwitterLoginButton'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'
import WalletSummary from '../Profile/WalletSummary'

const SectionWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  padding-top: 2rem;
  height: 100%;

  @media (max-width: 1080px) {
    padding: 0;
  }
`

const BackgroundWrapper = styled.div<{ account: boolean }>`
  background: ${({ theme }) => theme.bg2};
  padding: 1rem;
  height: ${({ account }) => (account ? '100%' : 'initial')};
  border-radius: 20px;

  max-width: 500px;
  margin: auto;
`

const TwitterButton = styled(ButtonBasic)`
  padding: 6px 12px;
  white-space: nowrap;
  width: 100%;
`

const TwitterLogo = styled.img`
  height: 24px;
  width: 24px;
`

export default function ProfileGeneric() {
  // account details
  const { account } = useActiveWeb3React()

  // UI views
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  // get any verified handles for this user + timestamps they were created at
  const [twitterAccount] = useTwitterAccount() // logged in account
  const verifiedHandleEntry = useVerifiedHandle(account)

  const loadingVerifiedHandles = verifiedHandleEntry === null

  // on redirect from twitter, if signed in, not verified, and no loading, show modal
  const [loaded, setLoaded] = useState(false)
  const { username: usernameQuery } = useParsedQueryString()
  useEffect(() => {
    if (twitterAccount && !verifiedHandleEntry && !loadingVerifiedHandles && !loaded && usernameQuery) {
      setShowTwitterFlow(true)
      setLoaded(true)
    }
  }, [loadingVerifiedHandles, twitterAccount, loaded, usernameQuery, verifiedHandleEntry])

  const primaryColor = '#2F80ED'
  const secondaryColor = '#EBF4FF'

  const ProfileContent = () => (
    <SectionWrapper>
      <BackgroundWrapper account={!!account}>
        <TYPE.main fontSize="20px" fontWeight="700" style={{ marginBottom: '1rem' }}>
          Your Sybil identity
        </TYPE.main>
        {!account ? (
          <TYPE.body fontWeight={500} fontSize="14px" color={primaryColor} mb="1rem">
            Connect wallet to link wallet address to Sybil identity.
            <ButtonCustom
              color={primaryColor}
              bgColor={secondaryColor}
              style={{
                fontWeight: 500,
                fontSize: '16px',
                marginTop: '16px',
              }}
              onClick={() => toggleWalletModal()}
            >
              Connect Wallet
            </ButtonCustom>
          </TYPE.body>
        ) : (
          <AutoColumn gap="16px">
            <WalletSummary />
            {!verifiedHandleEntry && account ? (
              !twitterAccount ? (
                <TwitterLoginButton text="Add a public identity" />
              ) : (
                <TwitterButton
                  onClick={() => {
                    ReactGA.event({
                      category: 'Social',
                      action: 'Start Link',
                      label: 'Not linked',
                    })
                    setShowTwitterFlow(true)
                  }}
                >
                  <RowBetween>
                    <TYPE.white fontSize="14px">Add a public identity</TYPE.white>
                    <TwitterLogo src={TwitterIcon} />
                  </RowBetween>
                </TwitterButton>
              )
            ) : null}
            {!verifiedHandleEntry && account ? (
              <TYPE.blue fontSize="14px">
                {`If the governance program you're participating in is not listed here, you can still add an identity to your ethereum address. Connecting your Twitter to your address can help people find you.`}
              </TYPE.blue>
            ) : null}
          </AutoColumn>
        )}
      </BackgroundWrapper>
    </SectionWrapper>
  )

  return (
    <>
      <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
        <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} />
      </Modal>
      <ProfileContent />
    </>
  )
}
