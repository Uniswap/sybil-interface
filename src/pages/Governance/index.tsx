import React, { useEffect, useState } from 'react'
import { BodyWrapper } from '../AppBody'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import {
  useActiveProtocol,
  useTopDelegates,
  DelegateData,
  useAllProposals,
  ProposalData,
  useGovernanceToken,
  useUserVotes,
  useUserDelegatee
} from '../../state/governance/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import Dropdown from '../../components/governance/Dropdown'
import DelegateList from '../../components/governance/DelegateList'
import Tabs from '../../components/governance/Tabs'
import Proposals from '../../components/governance/ProposalList'
import { useToggleModal } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'
import { useActiveWeb3React } from '../../hooks'
import { ApplicationModal } from '../../state/application/actions'
import { useTokenBalance } from '../../state/wallet/hooks'
import { TokenAmount, JSBI } from '@uniswap/sdk'
import { ZERO_ADDRESS } from '../../constants'
import { GreyCard } from '../../components/Card'
import { RowBetween, RowFixed, AutoRow } from '../../components/Row'
import { TYPE, ExternalLink } from '../../theme'
import { ButtonBasic } from '../../components/Button'
import { shortenAddress, getEtherscanLink } from '../../utils'
import CopyHelper from '../../components/AccountDetails/Copy'
import TwitterAccountDetails from '../../components/twitter/TwitterAccountDetails'

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 1.5em;
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

export enum ActiveTab {
  DELEGATES,
  PROPOSALS
}

export default function Overview({
  match: {
    params: { protocolId }
  }
}: RouteComponentProps<{ protocolId: string }>) {
  // if valid protocol id passed in, update global active protocol
  const dispatch = useDispatch<AppDispatch>()
  const [, setActiveProtocol] = useActiveProtocol()
  useEffect(() => {
    if (Object.keys(SUPPORTED_PROTOCOLS).includes(protocolId)) {
      setActiveProtocol(SUPPORTED_PROTOCOLS[protocolId])
    }
  }, [dispatch, protocolId, setActiveProtocol])

  // account details
  const { chainId, account } = useActiveWeb3React()
  const { name: ensName } = useENS(account)

  // UI views
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DELEGATES)
  const toggleWalletModal = useToggleModal(ApplicationModal.WALLET)
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)

  //  global gov data
  const topDelegates: DelegateData[] | undefined = useTopDelegates()
  const allProposals: ProposalData[] | undefined = useAllProposals()
  const govToken = useGovernanceToken()

  // user gov data
  const availableVotes: TokenAmount | undefined = useUserVotes()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, govToken)
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    govTokenBalance && JSBI.notEqual(govTokenBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  )

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
              {account && showUnlockVoting && (
                <RowBetween>
                  <AutoColumn gap="sm">
                    <AutoRow gap="6px">
                      <TYPE.mediumHeader mr="6px">{shortenAddress(account)}</TYPE.mediumHeader>
                      {account && chainId && (
                        <>
                          <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>↗</ExternalLink>
                          <CopyHelper toCopy={account} />
                        </>
                      )}
                    </AutoRow>
                    {ensName ?? ''}
                    <TYPE.darkYellow fontSize="12px">Unlock voting to participate in governance</TYPE.darkYellow>
                  </AutoColumn>
                  <RowFixed>
                    <TYPE.main mr="1rem">{govTokenBalance?.toFixed(0)} Votes</TYPE.main>
                    <ButtonBasic onClick={() => toggelDelegateModal()}>Unlock Voting</ButtonBasic>
                  </RowFixed>
                </RowBetween>
              )}
              {account && !showUnlockVoting && (
                <RowBetween>
                  <AutoColumn gap="sm">
                    <RowBetween>
                      <TYPE.mediumHeader mr="6px">{shortenAddress(account)}</TYPE.mediumHeader>
                      {account && chainId && (
                        <>
                          <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>↗</ExternalLink>
                          <CopyHelper toCopy={account} />
                        </>
                      )}
                    </RowBetween>
                    {ensName ?? ''}
                  </AutoColumn>
                  <AutoColumn gap="sm" justify="flex-end">
                    {availableVotes ? <TYPE.body>{availableVotes?.toFixed(0)} Total Votes</TYPE.body> : ''}
                    {userDelegatee === account && (
                      <RowFixed>
                        <TYPE.green>You are self delegated</TYPE.green>
                        <TYPE.green ml="4px" onClick={() => toggelDelegateModal()}>
                          (update)
                        </TYPE.green>
                      </RowFixed>
                    )}
                  </AutoColumn>
                </RowBetween>
              )}
              {account && <TwitterAccountDetails />}
            </AutoColumn>
          </AccountCard>
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === ActiveTab.DELEGATES ? (
            <DelegateList topDelegates={topDelegates} />
          ) : (
            <Proposals allProposals={allProposals} />
          )}
        </AutoColumn>
      </SectionWrapper>
    </BodyWrapper>
  )
}
