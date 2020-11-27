import React from 'react'
import { BodyWrapper } from '../AppBody'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { useGovernanceToken, useUserVotes, useUserDelegatee } from '../../state/governance/hooks'

import Dropdown from '../../components/governance/Dropdown'
import Tabs from '../../components/governance/Tabs'
import { useToggleModal } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React, useTheme } from '../../hooks'
import { ApplicationModal } from '../../state/application/actions'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TokenAmount, JSBI, Token, ChainId } from '@uniswap/sdk'
import { ZERO_ADDRESS, BIG_INT_ZERO } from '../../constants'
import { GreyCard } from '../../components/Card'
import { RowBetween, RowFixed, AutoRow } from '../../components/Row'
import { TYPE, ExternalLink } from '../../theme'
import { ButtonBasic, ButtonSecondary } from '../../components/Button'
import { shortenAddress, getEtherscanLink } from '../../utils'
import { Settings } from 'react-feather'
import TwitterAccountDetails from '../../components/twitter/TwitterAccountDetails'

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
`

const AccountCard = styled(GreyCard)`
  padding-top: 56px;
  margin-top: -48px;
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

const UpdateButton = styled(ButtonSecondary)`
  font-size: 12px;
  color: ${({ theme }) => theme.text3}
  border-color: ${({ theme }) => theme.text3}
  width: fit-content;
  padding:  4px;

  :hover {
    border-color: ${({ theme }) => theme.text2}
    color: ${({ theme }) => theme.text2}
  }

  &:active, &:focus {
    border-color: ${({ theme }) => theme.text3}
    box-shadow: 0 0 0 0.5pt ${({ theme }) => theme.text3};
  }
`

const ResponsiveRow = styled.div`
  width: 100%;
  display: flex;
  padding: 0;
  align-items: flex-start;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `};
`

const MobilePadding = styled.div`
  padding: 0;
  display: flex;
  width: 100%;
  justify-content: flex-end;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 2rem 0;
    justify-content: flex-start;
  `};
`

export default function Overview() {
  const theme = useTheme()

  // account details
  const { chainId, account } = useActiveWeb3React()
  const { name: ensName } = useENS(account)

  // UI views
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)

  const govToken: Token | undefined = useGovernanceToken()

  // user gov data
  const availableVotes: TokenAmount | undefined = useUserVotes()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, govToken)
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    govTokenBalance && JSBI.notEqual(govTokenBalance.raw, BIG_INT_ZERO) && userDelegatee === ZERO_ADDRESS
  )

  // if delegate that isnt user or 0 address, show balance delegated
  const showDelegatedCount = userDelegatee && account && userDelegatee !== ZERO_ADDRESS

  // hide update button if no votes
  const hideUpdateButton = govTokenBalance && JSBI.equal(govTokenBalance.raw, BIG_INT_ZERO)

  return (
    <BodyWrapper>
      <SectionWrapper>
        <AutoColumn gap="1rem">
          <Dropdown />
          <AccountCard>
            <AutoColumn gap="lg">
              {!account && (
                <RowBetween>
                  <RowFixed>
                    <EmptyCircle />
                    <AutoColumn gap="10px">
                      <TYPE.main fontSize="20px">Your Address</TYPE.main>
                      <TYPE.main fontSize="12px">
                        Connect wallet to see your votes or announce yourself as a delegate.
                      </TYPE.main>
                    </AutoColumn>
                  </RowFixed>
                  <ButtonBasic width="fit-content" onClick={toggleWalletModal}>
                    Connect wallet
                  </ButtonBasic>
                </RowBetween>
              )}
              <ResponsiveRow>
                <AutoColumn gap="sm">
                  {account && chainId && (
                    <RowFixed style={{ width: 'fit-content' }}>
                      <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>
                        <TYPE.mediumHeader mr="10px" color={theme.text1}>
                          {shortenAddress(account)}
                        </TYPE.mediumHeader>
                      </ExternalLink>
                      <StyledSettings onClick={toggleWalletModal} stroke="black" />
                    </RowFixed>
                  )}
                  {ensName ?? ''}
                  {account && showUnlockVoting && (
                    <TYPE.darkYellow fontSize="12px">Unlock voting to participate in governance</TYPE.darkYellow>
                  )}
                </AutoColumn>
                <MobilePadding>
                  {account && !showUnlockVoting && userDelegatee && userDelegatee !== account && (
                    <RowFixed>
                      <TYPE.main mr="8px">{govTokenBalance?.toFixed(0)} votes</TYPE.main>
                      {showDelegatedCount && (
                        <RowFixed>
                          delegated to
                          <ExternalLink
                            style={{ margin: '0 6px' }}
                            href={getEtherscanLink(ChainId.MAINNET, userDelegatee, 'address')}
                          >
                            {shortenAddress(userDelegatee)}
                          </ExternalLink>
                        </RowFixed>
                      )}
                      {!hideUpdateButton && <UpdateButton onClick={() => toggelDelegateModal()}>Update</UpdateButton>}
                    </RowFixed>
                  )}
                  {account && showUnlockVoting && (
                    <RowFixed>
                      <TYPE.main mr="1rem">{govTokenBalance?.toFixed(0)} Votes</TYPE.main>
                      <ButtonBasic onClick={() => toggelDelegateModal()}>Unlock Voting</ButtonBasic>
                    </RowFixed>
                  )}
                  {account && !showUnlockVoting && userDelegatee === account && (
                    <AutoColumn gap="sm" justify="flex-end">
                      {availableVotes ? <TYPE.main>{availableVotes?.toFixed(0)} Votes</TYPE.main> : ''}
                      {userDelegatee === account && (
                        <RowFixed>
                          <TYPE.green mr="8px">You are self delegated</TYPE.green>
                          {!hideUpdateButton && (
                            <UpdateButton onClick={() => toggelDelegateModal()}>Update</UpdateButton>
                          )}
                        </RowFixed>
                      )}
                    </AutoColumn>
                  )}
                </MobilePadding>
              </ResponsiveRow>
              {account && <TwitterAccountDetails />}
            </AutoColumn>
          </AccountCard>
          <Tabs />
        </AutoColumn>
      </SectionWrapper>
    </BodyWrapper>
  )
}
