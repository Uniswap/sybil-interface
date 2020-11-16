import React from 'react'

import { AutoColumn } from '../Column'
import { RowBetween, RowFixed, AutoRow } from '../Row'
import { ButtonBasic } from '../Button'
import { TYPE, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { GreyCard } from '../Card'
import { shortenAddress, getEtherscanLink } from '../../utils'
import TwitterAccountSection from './TwitterAccountSection'
import { useWalletModalToggle, useToggleModal } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'
import { useUserVotes, useUserDelegatee, useGovernanceToken } from '../../state/governance/hooks'
import styled from 'styled-components'
import CopyHelper from '../AccountDetails/Copy'
import { useTokenBalance } from '../../state/wallet/hooks'
import { ZERO_ADDRESS } from '../../constants'
import { ApplicationModal } from '../../state/application/actions'
import { TokenAmount, JSBI } from '@uniswap/sdk'

const EmptyCircle = styled.div`
  height: 48px;
  width: 48px;
  background: ${({ theme }) => theme.bg3};
  border-radius: 50%;
  margin-right: 1rem;
`

export default function GovernanceAccountSection() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // if not attested, show twitter flow
  const { name: ensName } = useENS(account)

  // toggle for showing delegation modal
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)

  // get protocol specific data
  const govToken = useGovernanceToken()

  // user data
  const availableVotes: TokenAmount | undefined = useUserVotes()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, govToken)
  const userDelegatee: string | undefined = useUserDelegatee()

  // show delegation option if they have have a balance, but have not delegated
  const showUnlockVoting = Boolean(
    govTokenBalance && JSBI.notEqual(govTokenBalance.raw, JSBI.BigInt(0)) && userDelegatee === ZERO_ADDRESS
  )

  return (
    <GreyCard>
      <AutoColumn gap="lg">
        {!account && (
          <RowBetween>
            <RowFixed>
              <EmptyCircle />
              <AutoColumn gap="10px">
                <TYPE.main fontSize="20px">Your Address</TYPE.main>
                <TYPE.main fontSize="12px">
                  Connect a wallet to see your votes or announce yourself as a delegate.
                </TYPE.main>
              </AutoColumn>
            </RowFixed>
            <ButtonBasic width="fit-content" onClick={toggleWalletModal}>
              Connect a wallet
            </ButtonBasic>
          </RowBetween>
        )}
        {account && showUnlockVoting && (
          <>
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
            <TwitterAccountSection />
          </>
        )}
        {account && !showUnlockVoting && (
          <>
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
            <TwitterAccountSection />
          </>
        )}
      </AutoColumn>
    </GreyCard>
  )
}
