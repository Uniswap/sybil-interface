import React, { useState, useEffect } from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { useToggleModal } from '../../state/application/hooks'
import { useActiveWeb3React, useTheme } from '../../hooks'
import ReactGA from 'react-ga'
import { ApplicationModal } from '../../state/application/actions'
import Card from '../Card'
import { RowFixed, RowBetween } from '../Row'
import { TYPE, BlankInternalLink } from '../../theme'
import { ButtonBasic, ButtonCustom } from '../Button'
import { shortenAddress } from '../../utils'
import { useVerifiedHandle, useTwitterProfileData } from '../../state/social/hooks'
import { useTwitterAccount } from '../../state/user/hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import Modal from '../Modal'
import TwitterFlow from '../twitter/TwitterFlow'
import TwitterLoginButton from '../twitter/TwitterLoginButton'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'
import LogoText from '../governance/LogoText'
import { lighten } from 'polished'
import VoteContent from './VoteContent'
import WalletSummary from './WalletSummary'

const SectionWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  padding-top: 2rem;
  height: 100%;

  @media (max-width: 1080px) {
    padding: 0;
  }
`

const BackgroundWrapper = styled.div<{ bgColor?: string; account: boolean }>`
  background: ${({ theme, bgColor, account }) =>
    !account ? theme.bg2 : `linear-gradient(180deg, ${bgColor} 0%, ${theme.bg1} 100%);`};
  padding: 1rem;
  height: ${({ account }) => (account ? '100%' : 'initial')};
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  border-bottom-right-radius: ${({ account }) => (!account ? '20px' : '0')};
  border-bottom-left-radius: ${({ account }) => (!account ? '20px' : '0')};
`

const ButtonText = styled(TYPE.white)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
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

const RoundedProfileImage = styled.div`
  height: 48px;
  width: 48px;
  background: ${({ theme }) => theme.bg4};
  border-radius: 50%;
  margin-right: 16px;

  & > img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`

const Above1080Only = styled.span`
  display: initial;
  @media (max-width: 1080px) {
    display: none;
  }
`

const MobileWrapper = styled.div`
  display: none;
  @media (max-width: 1080px) {
    display: initial;
    position: fixed;
    width: 100%;
    bottom: 0;
    background-color: ${({ theme }) => theme.bg2};
    z-index: 2;
    padding: 0.5rem;
    border-top-right-radius: 25px;
    border-top-left-radius: 25px;
  }
`

export default function Profile() {
  const theme = useTheme()

  // account details
  const { chainId, account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // UI views
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  // get any verified handles for this user + timestamps they were created at
  const [twitterAccount] = useTwitterAccount() // logged in account
  const verifiedHandleEntry = useVerifiedHandle(account)

  const loadingVerifiedHandles = verifiedHandleEntry === null
  const profileData = useTwitterProfileData(verifiedHandleEntry?.handle)

  // on redirect from twitter, if signed in, not verified, and no loading, show modal
  const [loaded, setLoaded] = useState(false)
  const { username: usernameQuery } = useParsedQueryString()
  useEffect(() => {
    if (twitterAccount && !verifiedHandleEntry && !loadingVerifiedHandles && !loaded && usernameQuery) {
      setShowTwitterFlow(true)
      setLoaded(true)
    }
  }, [loadingVerifiedHandles, twitterAccount, loaded, usernameQuery, verifiedHandleEntry])

  // toggle for mobile view
  const [showProfileModal, setShowProfileModal] = useState(false)

  const ProfileContent = () => (
    <SectionWrapper>
      <BackgroundWrapper
        account={!!account}
        bgColor={
          account
            ? lighten('0.01', activeProtocol?.secondaryColor ? activeProtocol.secondaryColor : theme.bg2)
            : theme.bg2
        }
      >
        <TYPE.main mb="16px">
          Your <span style={{ color: activeProtocol?.primaryColor }}> {activeProtocol?.name}</span> profile
        </TYPE.main>
        {!account ? (
          <Above1080Only>
            <TYPE.body fontWeight={500} fontSize="14px" color={activeProtocol?.primaryColor} mb="1rem">
              Connect wallet to see voting power and link wallet address to Sybil identity.
            </TYPE.body>
            {activeProtocol && (
              <ButtonCustom
                color={activeProtocol?.primaryColor}
                bgColor={activeProtocol?.secondaryColor}
                style={{
                  fontWeight: 500,
                  fontSize: '16px',
                }}
                onClick={() => toggleWalletModal()}
              >
                Connect Wallet
              </ButtonCustom>
            )}
          </Above1080Only>
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
              <TYPE.blue fontSize="12px">
                Connecting your Twitter to your address can help people find you and delegate votes to you.
              </TYPE.blue>
            ) : null}
            <VoteContent />
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
      <MobileWrapper>
        <Modal isOpen={showProfileModal} onDismiss={() => setShowProfileModal(false)}>
          <ProfileContent />
        </Modal>
        <Card padding="10px">
          <RowBetween>
            <BlankInternalLink to={`/delegates/${activeProtocol?.id}/${account}`}>
              <RowFixed>
                <RoundedProfileImage>
                  <img src={!profileData?.profileURL ? EmptyProfile : profileData?.profileURL} />
                </RoundedProfileImage>
                {!account ? (
                  <TYPE.main>Your Address</TYPE.main>
                ) : (
                  chainId &&
                  (verifiedHandleEntry?.handle ? (
                    <AutoColumn gap="4px">
                      <LogoText type="twitter">@{verifiedHandleEntry.handle}</LogoText>
                      <TYPE.main fontSize="12px">{shortenAddress(account)}</TYPE.main>
                    </AutoColumn>
                  ) : (
                    <TYPE.main mr="10px" color={theme.text1}>
                      {shortenAddress(account)}
                    </TYPE.main>
                  ))
                )}
              </RowFixed>
            </BlankInternalLink>
            {!account ? (
              <ButtonBasic width="fit-content" onClick={toggleWalletModal}>
                <ButtonText>Connect wallet</ButtonText>
              </ButtonBasic>
            ) : (
              <RowFixed>
                <ButtonCustom onClick={() => setShowProfileModal(true)} bgColor={activeProtocol?.secondaryColor}>
                  <TYPE.body color={activeProtocol?.primaryColor} fontWeight={500}>
                    Details
                  </TYPE.body>
                </ButtonCustom>
              </RowFixed>
            )}
          </RowBetween>
        </Card>
      </MobileWrapper>
      <Above1080Only>
        <ProfileContent />
      </Above1080Only>
    </>
  )
}
