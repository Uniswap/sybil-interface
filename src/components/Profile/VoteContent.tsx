import React from 'react'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import {
  useGovernanceToken,
  useUserVotes,
  useDelegateInfo,
  useUserDelegatee,
  useActiveProtocol,
} from '../../state/governance/hooks'
import { useToggleModal } from '../../state/application/hooks'
import { useActiveWeb3React, useTheme } from '../../hooks'
import { ApplicationModal } from '../../state/application/actions'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TokenAmount, Token } from '@uniswap/sdk'
import { ZERO_ADDRESS, BIG_INT_ZERO } from '../../constants'
import Card, { WhiteCard } from '../Card'
import { RowFixed, RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { ButtonBasic, ButtonCustom } from '../Button'
import { CornerDownRight } from 'react-feather'
import Loader from '../Loader'
import { CloseIcon, StyledInternalLink } from '../../theme/components'
import { useAllIdentities } from '../../state/social/hooks'
import { nameOrAddress } from '../../utils/getName'
import { Break } from '../../pages/DelegateInfo'

const OffsetCard = styled(Card)<{ bgColor?: string }>`
  background-color: ${({ theme, bgColor }) => bgColor ?? theme.bg1};
  padding: 1rem;
  padding: 16px;
  margin-top: -40px;
  padding-top: 32px;
  z-index: 1;
`

export default function VoteContent() {
  const theme = useTheme()

  // account details
  const { account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // UI views
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

  // used for displaying names
  const [allIdentities] = useAllIdentities()

  return (
    <AutoColumn gap="16px">
      <WhiteCard border={`1px solid ${theme.bg3}`} style={{ zIndex: 2 }} padding="1rem">
        <RowBetween>
          <TYPE.black color={theme.text1}>Wallet votes</TYPE.black>
          <TYPE.main color={activeProtocol?.primaryColor}>
            {walletVotes ? walletVotes.toFixed(0) : account ? <Loader /> : '-'}
          </TYPE.main>
        </RowBetween>
      </WhiteCard>
      {userDelegatee && userDelegatee !== ZERO_ADDRESS && (
        <OffsetCard bgColor={activeProtocol?.secondaryColor}>
          {userDelegatee === account ? (
            <RowBetween>
              <TYPE.body fontSize="14px" fontWeight={500} color={activeProtocol?.primaryColor}>
                Self delegated
              </TYPE.body>
              <ButtonCustom
                bgColor={theme.bg4}
                padding="4px 8px"
                borderRadius="8px"
                color={theme.text1}
                style={{ fontSize: '14px', width: 'fit-content' }}
                onClick={() => toggelDelegateModal()}
              >
                Update
              </ButtonCustom>
            </RowBetween>
          ) : (
            <RowBetween>
              <RowFixed>
                <CornerDownRight size="14px" stroke={activeProtocol?.primaryColor} />{' '}
                <TYPE.main ml="2px" fontSize="14px" color={activeProtocol?.primaryColor}>
                  Delegating to
                </TYPE.main>
              </RowFixed>
              <RowFixed style={{ backgroundColor: theme.bg1, borderRadius: '20px', padding: '0.25rem 0.5rem' }}>
                <StyledInternalLink to={`/delegates/${activeProtocol?.id}/${userDelegatee}`}>
                  <TYPE.main fontSize="14px" mr="2px" color={theme.blue1}>
                    {userDelegatee !== account ? nameOrAddress(userDelegatee, allIdentities, true) : 'self'}
                  </TYPE.main>
                </StyledInternalLink>
                <CloseIcon stroke={theme.text2} size="16px" onClick={() => toggelDelegateModal()} />
              </RowFixed>
            </RowBetween>
          )}
        </OffsetCard>
      )}
      {userDelegatee && userDelegatee === ZERO_ADDRESS && govTokenBalance && govTokenBalance.greaterThan(BIG_INT_ZERO) && (
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
        padding="16px"
        opacity={receivedVotes?.greaterThan(BIG_INT_ZERO) ? '1' : '0.5'}
        style={{ zIndex: 3 }}
      >
        <RowBetween>
          <TYPE.black color={theme.text1}>Received votes</TYPE.black>
          <TYPE.main color={activeProtocol?.primaryColor}>
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
        padding="16px"
      >
        {userDelegatee &&
        userDelegatee !== ZERO_ADDRESS &&
        userDelegatee !== account &&
        receivedVotes?.equalTo(BIG_INT_ZERO) ? (
          'You are delegating all your voting power'
        ) : (
          <RowBetween style={{ color: activeProtocol?.primaryColor, fontWeight: 600 }}>
            <span>Total votes</span>
            <span>{totalVotes ? totalVotes.toFixed(0) : account ? <Loader /> : '-'}</span>
          </RowBetween>
        )}
      </Card>
    </AutoColumn>
  )
}
