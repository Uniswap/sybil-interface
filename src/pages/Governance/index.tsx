import React, { useMemo } from 'react'
import { BodyWrapper } from '../AppBody'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { useGovernanceToken, useUserVotes, useUserDelegatee, useActiveProtocol } from '../../state/governance/hooks'
import Dropdown from '../../components/governance/Dropdown'
import { useToggleModal } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React, useTheme } from '../../hooks'
import { ApplicationModal } from '../../state/application/actions'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TokenAmount, Token, ChainId, JSBI } from '@uniswap/sdk'
import { ZERO_ADDRESS, BIG_INT_ZERO } from '../../constants'
import { GreyCard } from '../../components/Card'
import { RowFixed, RowBetween } from '../../components/Row'
import { TYPE, ExternalLink, BlankInternalLink } from '../../theme'
import { ButtonBasic, ButtonGray, ButtonBlue, ButtonSecondary } from '../../components/Button'
import { shortenAddress, getEtherscanLink } from '../../utils'
import { Settings, CornerDownRight } from 'react-feather'
import TwitterAccountDetails from '../../components/twitter/TwitterAccountDetails'
import Loader from '../../components/Loader'
import QuestionHelper from '../../components/QuestionHelper'
import { useAllTransactions, isTransactionRecent } from '../../state/transactions/hooks'
import { newTransactionsFirst } from '../../components/Web3Status'
import { LoadingFlag } from '../../theme/components'
import { isMobile } from 'react-device-detect'
import { useAllIdentities } from '../../state/social/hooks'
import { nameOrAddress } from '../../utils/getName'

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1.5em;
  margin-bottom: 1rem;
`
const EmptyCircle = styled.div`
  height: 48px;
  width: 48px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 50%;
  margin-right: 1rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const AccountCard = styled(GreyCard)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
  `};
`

const Votes = styled(GreyCard)`
  padding-top: 56px;
  margin-top: -56px;
  background-color: ${({ theme }) => theme.bg3};
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`

    gap: 12px;
  `};
`

const VoteCount = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px 12px;
  color: #000;
  background-color: white;
  background: #ffffff;
  border-radius: 12px;
  flex-grow: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-grow: 0;
  `};
`

const StyledSettings = styled(Settings)`
  stroke: ${({ theme }) => theme.text3};
  height: 18px;
  width: 18px;

  :hover {
    cursor: pointer;
    stroke: ${({ theme }) => theme.text2};
  }
`

const UpdateButton = styled(ButtonGray)`
  font-size: 12px;
  width: fit-content;
  padding: 4px 6px;
  border-radius: 8px;
`

const FixedWidthAtSmall = styled(AutoColumn)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 160px;
  `};
`

const ButtonText = styled(TYPE.white)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

export default function Overview() {
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
  const availableVotes: TokenAmount | undefined = useUserVotes()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, govToken)
  const userDelegatee: string | undefined = useUserDelegatee()

  // if delegated to real address, show token balance + available, if not use available votes from contract
  const voteCount: TokenAmount | undefined =
    govTokenBalance && availableVotes
      ? userDelegatee && userDelegatee !== account
        ? govTokenBalance.add(availableVotes)
        : availableVotes
      : undefined

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

  return (
    <BodyWrapper>
      <SectionWrapper>
        <Dropdown />
        {!account && (
          <GreyCard>
            <RowBetween>
              <RowFixed>
                <EmptyCircle />
                <FixedWidthAtSmall gap="10px">
                  <TYPE.main fontSize="20px">Your Address</TYPE.main>
                  <TYPE.main fontSize="12px">Connect wallet to sign in or announce yourself as a delegate.</TYPE.main>
                </FixedWidthAtSmall>
              </RowFixed>
              <ButtonBasic width="fit-content" onClick={toggleWalletModal}>
                <ButtonText>Connect wallet</ButtonText>
              </ButtonBasic>
            </RowBetween>
          </GreyCard>
        )}
        {account && (
          <>
            <AccountCard>
              {account && chainId && (
                <RowFixed style={{ width: 'fit-content' }}>
                  <AutoColumn gap="sm">
                    <TYPE.subHeader>Your delegate address</TYPE.subHeader>
                    <RowFixed>
                      <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>
                        <TYPE.mediumHeader mr="10px" color={theme.text1}>
                          {ensName ?? shortenAddress(account)}
                        </TYPE.mediumHeader>
                      </ExternalLink>
                      <StyledSettings onClick={toggleWalletModal} stroke="black" />
                      {hasPendingTransactions && (
                        <LoadingFlag style={{ marginLeft: '10px' }} onClick={toggleWalletModal}>
                          {pending?.length} pending <Loader style={{ marginLeft: '4px', height: '12px' }} />
                        </LoadingFlag>
                      )}
                    </RowFixed>
                  </AutoColumn>
                </RowFixed>
              )}
              <TwitterAccountDetails />
            </AccountCard>
            <Votes>
              {!govTokenBalance && <Loader />}
              {voteCount && chainId === ChainId.MAINNET && (
                <VoteCount>
                  <TYPE.black>
                    <b>{voteCount.toSignificant(3)}</b> {!isMobile && 'votes'}
                  </TYPE.black>
                  {userDelegatee === ZERO_ADDRESS &&
                    govTokenBalance &&
                    JSBI.greaterThan(govTokenBalance.raw, BIG_INT_ZERO) && (
                      <TYPE.error fontSize={14} error={true} ml="8px">
                        (currently inactive)
                      </TYPE.error>
                    )}
                  {JSBI.equal(BIG_INT_ZERO, voteCount.raw) && (
                    <QuestionHelper
                      text={`Hold ${activeProtocol?.token.symbol} to be be able to self-delegate or delegate to others.`}
                    />
                  )}
                </VoteCount>
              )}
              {govTokenBalance && (
                <span style={{ margin: '0 12px', width: 20, height: 20 }}>
                  <CornerDownRight size={20} />
                </span>
              )}
              {userDelegatee &&
                (userDelegatee === ZERO_ADDRESS &&
                govTokenBalance &&
                JSBI.notEqual(BIG_INT_ZERO, govTokenBalance.raw) ? (
                  <ButtonSecondary
                    style={{ flexGrow: 1, fontSize: 16, padding: '8px 12px', width: 'unset' }}
                    onClick={() => toggelDelegateModal()}
                  >
                    Delegate votes
                  </ButtonSecondary>
                ) : (
                  <VoteCount>
                    {userDelegatee === ZERO_ADDRESS && 'No votes to delegate'}
                    {userDelegatee !== account && userDelegatee !== ZERO_ADDRESS ? (
                      <RowFixed>
                        {!isMobile && <TYPE.main mr="4px">Delegated to:</TYPE.main>}
                        <BlankInternalLink to={activeProtocol?.id + '/' + userDelegatee}>
                          <TYPE.blue mr="4px">{nameOrAddress(userDelegatee, allIdentities, true)}</TYPE.blue>
                        </BlankInternalLink>
                        <UpdateButton onClick={() => toggelDelegateModal()}>
                          {!isMobile ? 'change' : 'edit'}
                        </UpdateButton>
                      </RowFixed>
                    ) : userDelegatee === ZERO_ADDRESS &&
                      govTokenBalance &&
                      JSBI.notEqual(BIG_INT_ZERO, govTokenBalance.raw) ? (
                      <ButtonBlue
                        style={{ flexGrow: 1, fontSize: 16, padding: '8px 12px', width: 'unset' }}
                        onClick={() => toggelDelegateModal()}
                      >
                        Choose Delegate
                      </ButtonBlue>
                    ) : (
                      userDelegatee === account && (
                        <>
                          {!isMobile && <TYPE.main mr="4px">Delegated to:</TYPE.main>}
                          <TYPE.black mr="8px">Self</TYPE.black>{' '}
                          {govTokenBalance && JSBI.notEqual(BIG_INT_ZERO, govTokenBalance?.raw) && (
                            <UpdateButton onClick={() => toggelDelegateModal()}>Change</UpdateButton>
                          )}
                        </>
                      )
                    )}
                  </VoteCount>
                ))}
            </Votes>
          </>
        )}
      </SectionWrapper>
    </BodyWrapper>
  )
}
