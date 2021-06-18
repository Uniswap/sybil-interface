import React, { useMemo, useState, useEffect } from 'react'
import { AutoColumn } from '../../../components/Column'
import styled from 'styled-components'
import {
  useGovernanceToken,
  useUserVotes,
  useDelegateInfo,
  useUserDelegatee,
  useActiveProtocol
} from '../../../state/governance/hooks'
import EmptyProfile from '../../../assets/images/emptyprofile.png'
import { useToggleModal } from '../../../state/application/hooks'
import useENS from '../../../hooks/useENS'
import { useActiveWeb3React, useTheme } from '../../../hooks'
import WalletIcon from '../../../assets/images/wallet-icon.png'
import ReactGA from 'react-ga'
import { ApplicationModal } from '../../../state/application/actions'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { TokenAmount, Token } from '@uniswap/sdk'
import { ZERO_ADDRESS, BIG_INT_ZERO } from '../../../constants'
import Card, { WhiteCard } from '../../../components/Card'
import { RowFixed, RowBetween } from '../../../components/Row'
import { TYPE, BlankInternalLink } from '../../../theme'
import { ButtonBasic, ButtonCustom, ButtonEmpty } from '../../../components/Button'
import { shortenAddress } from '../../../utils'
import { CornerDownRight, ChevronUp } from 'react-feather'
import Loader from '../../../components/Loader'
import { useAllTransactions, isTransactionRecent } from '../../../state/transactions/hooks'
import { newTransactionsFirst } from '../../../components/Web3Status'
import { CloseIcon, StyledInternalLink, LoadingFlag } from '../../../theme/components'
import { useAllIdentities, useVerifiedHandle, useTwitterProfileData } from '../../../state/social/hooks'
import { nameOrAddress } from '../../../utils/getName'
import { useTwitterAccount } from '../../../state/user/hooks'
import useParsedQueryString from '../../../hooks/useParsedQueryString'
import Modal from '../../Modal'
import TwitterFlow from '../../twitter/TwitterFlow'
import TwitterLoginButton from '../../twitter/TwitterLoginButton'
import TwitterIcon from '../../../assets/images/Twitter_Logo_Blue.png'
import { Break } from '../../../pages/DelegateInfo'
import LogoText from '../LogoText'
import { lighten } from 'polished'

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
    !account ? theme.bg2 : `linear-gradient(180deg, ${bgColor} 0%, ${theme.bg1} 100%);`} 
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

const StyledWalletIcon = styled.img`
  width: 18px;
  height: 18px;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
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

const OffsetCard = styled(Card)<{ bgColor?: string }>`
  background-color: ${({ theme, bgColor }) => bgColor ?? theme.bg1};
  margin-top: -40px;
  padding-top: 40px;
  z-index: 1;
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
  const { name: ensName } = useENS(account)

  // UI views
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)

  const govToken: Token | undefined = useGovernanceToken()

  // user gov data
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, govToken)
  const userDelegatee: string | undefined = useUserDelegatee()
  const userDelegateInfo = useDelegateInfo(account ?? undefined)

  // all available votes - personal and delgated
  const totalVotes: TokenAmount | undefined = useUserVotes()

  // votes from users personal balance only
  const walletVotes =
    govTokenBalance && userDelegatee && userDelegatee !== ZERO_ADDRESS
      ? govTokenBalance
      : govToken && userDelegatee && govTokenBalance // if all loaded must be 0
      ? new TokenAmount(govToken, BIG_INT_ZERO)
      : undefined

  // votes delegated from other wallets only
  const receivedVotes =
    totalVotes && walletVotes && userDelegatee === account && totalVotes.greaterThan(walletVotes)
      ? totalVotes.subtract(walletVotes)
      : totalVotes ?? undefined

  // amount of addresses delegated to account, not including account
  const delegatorsCount = userDelegateInfo
    ? userDelegateInfo?.tokenHoldersRepresentedAmount - (userDelegatee && userDelegatee === account ? 1 : 0)
    : 0

  // show pending txns if needed
  const allTransactions = useAllTransactions()
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const hasPendingTransactions = !!pending.length

  // used for displaying names
  const [allIdentities] = useAllIdentities()

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
        <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
          <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} />
        </Modal>
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
                  fontSize: '16px'
                }}
                onClick={() => toggleWalletModal()}
              >
                Connect Wallet
              </ButtonCustom>
            )}
          </Above1080Only>
        ) : (
          <AutoColumn gap="16px">
            <WhiteCard padding="10px">
              <RowBetween>
                <BlankInternalLink to={`/delegates/${activeProtocol?.id}/${account}`}>
                  <RowFixed>
                    {account && (
                      <RoundedProfileImage>
                        <img src={!profileData?.profileURL ? EmptyProfile : profileData?.profileURL} />
                      </RoundedProfileImage>
                    )}
                    {!account ? (
                      <TYPE.main>Your Address</TYPE.main>
                    ) : (
                      chainId &&
                      (verifiedHandleEntry?.handle ? (
                        <AutoColumn gap="4px">
                          <LogoText type="twitter">@{verifiedHandleEntry.handle}</LogoText>
                          <TYPE.main fontSize="12px">{ensName ?? shortenAddress(account)}</TYPE.main>
                        </AutoColumn>
                      ) : (
                        <TYPE.main mr="10px" color={theme.text1}>
                          {ensName ?? shortenAddress(account)}
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
                    {hasPendingTransactions && (
                      <LoadingFlag style={{ marginRight: '10px' }} onClick={toggleWalletModal}>
                        {pending?.length} pending <Loader style={{ marginLeft: '4px', height: '12px' }} />
                      </LoadingFlag>
                    )}
                    <StyledWalletIcon src={WalletIcon} onClick={toggleWalletModal} />
                  </RowFixed>
                )}
              </RowBetween>
            </WhiteCard>
            {!verifiedHandleEntry && account ? (
              !twitterAccount ? (
                <TwitterLoginButton text="Announce yourself as a delegate" />
              ) : (
                <TwitterButton
                  onClick={() => {
                    ReactGA.event({
                      category: 'Social',
                      action: 'Start Link',
                      label: 'Not linked'
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
            <WhiteCard border={`1px solid ${theme.bg3}`} style={{ zIndex: 2 }}>
              <RowBetween>
                <TYPE.black color={theme.text2}>Wallet voting power</TYPE.black>
                <TYPE.main color={theme.text1}>
                  {walletVotes ? walletVotes.toFixed(0) : account ? <Loader /> : '-'}
                </TYPE.main>
              </RowBetween>
            </WhiteCard>
            {userDelegatee && userDelegatee !== ZERO_ADDRESS && (
              <OffsetCard bgColor={theme.bg3}>
                {userDelegatee === account ? (
                  <RowBetween>
                    <TYPE.body fontSize="14px" fontWeight={500} color={theme.text2}>
                      Selft delegated
                    </TYPE.body>
                    <ButtonCustom
                      bgColor={theme.bg4}
                      color={theme.text1}
                      style={{ fontSize: '14px', width: 'fit-content' }}
                      onClick={() => toggelDelegateModal()}
                    >
                      Delegate Votes
                    </ButtonCustom>
                  </RowBetween>
                ) : (
                  <RowBetween>
                    <RowFixed>
                      <CornerDownRight size="14px" stroke={theme.text2} />{' '}
                      <TYPE.main ml="2px" fontSize="14px" color={theme.text2}>
                        Delegating to
                      </TYPE.main>
                    </RowFixed>
                    <RowFixed style={{ backgroundColor: theme.bg1, borderRadius: '20px', padding: '0.25rem 0.5rem' }}>
                      <StyledInternalLink to={`/delegates/${activeProtocol?.id}/${userDelegatee}`}>
                        <TYPE.main fontSize="14px" mr="2px" color={activeProtocol?.primaryColor}>
                          {userDelegatee !== account ? nameOrAddress(userDelegatee, allIdentities, true) : 'self'}
                        </TYPE.main>
                      </StyledInternalLink>
                      <CloseIcon stroke={theme.text2} size="16px" onClick={() => toggelDelegateModal()} />
                    </RowFixed>
                  </RowBetween>
                )}
              </OffsetCard>
            )}
            {userDelegatee &&
              userDelegatee === ZERO_ADDRESS &&
              govTokenBalance &&
              govTokenBalance.greaterThan(BIG_INT_ZERO) && (
                <OffsetCard bgColor={theme.blue3}>
                  <RowBetween>
                    <RowFixed>
                      <TYPE.blue ml="4px" fontSize="14px">
                        {govTokenBalance.toFixed(0)} inactive votes
                      </TYPE.blue>
                    </RowFixed>
                    <ButtonBasic onClick={() => toggelDelegateModal()}>
                      <TYPE.white fontSize="14px">Set up voting</TYPE.white>
                    </ButtonBasic>
                  </RowBetween>
                </OffsetCard>
              )}
            <WhiteCard
              border={`1px solid ${theme.bg3}`}
              opacity={receivedVotes?.greaterThan(BIG_INT_ZERO) ? '1' : '0.5'}
              style={{ zIndex: 3 }}
            >
              <RowBetween>
                <TYPE.black color={theme.text2}>Received voting power</TYPE.black>
                <TYPE.main color={theme.text1}>
                  {receivedVotes ? receivedVotes.toFixed(0) : account ? <Loader /> : '-'}
                </TYPE.main>
              </RowBetween>
            </WhiteCard>
            {delegatorsCount > 0 && (
              <OffsetCard bgColor={theme.green2}>
                <TYPE.main fontWeight={500} color={theme.green1} fontSize="14px">
                  {delegatorsCount} {delegatorsCount > 1 ? 'addresses have' : 'address has'} delegated to you
                </TYPE.main>
              </OffsetCard>
            )}
            <Break />
            <Card
              backgroundColor={activeProtocol?.secondaryColor}
              color={activeProtocol?.primaryColor}
              fontWeight={500}
            >
              {userDelegatee &&
              userDelegatee !== ZERO_ADDRESS &&
              userDelegatee !== account &&
              receivedVotes?.equalTo(BIG_INT_ZERO) ? (
                'You are delegating all your voting power'
              ) : (
                <RowBetween style={{ color: activeProtocol?.primaryColor, fontWeight: 500 }}>
                  <span>Total voting power</span>
                  <span>{totalVotes ? totalVotes.toFixed(0) : account ? <Loader /> : '-'}</span>
                </RowBetween>
              )}
            </Card>
          </AutoColumn>
        )}
      </BackgroundWrapper>
    </SectionWrapper>
  )

  return (
    <>
      <Modal isOpen={showProfileModal} onDismiss={() => setShowProfileModal(false)}>
        <ProfileContent />
      </Modal>
      <MobileWrapper>
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
                      <TYPE.main fontSize="12px">{ensName ?? shortenAddress(account)}</TYPE.main>
                    </AutoColumn>
                  ) : (
                    <TYPE.main mr="10px" color={theme.text1}>
                      {ensName ?? shortenAddress(account)}
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
                {hasPendingTransactions && (
                  <LoadingFlag style={{ marginRight: '10px' }} onClick={toggleWalletModal}>
                    {pending?.length} pending <Loader style={{ marginLeft: '4px', height: '12px' }} />
                  </LoadingFlag>
                )}
                <ButtonEmpty onClick={() => setShowProfileModal(true)}>
                  {totalVotes && (
                    <TYPE.main mr="4px" color={activeProtocol?.primaryColor}>
                      {totalVotes?.toFixed(0)} Votes
                    </TYPE.main>
                  )}
                  <ChevronUp stroke={activeProtocol?.primaryColor} />
                </ButtonEmpty>
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
