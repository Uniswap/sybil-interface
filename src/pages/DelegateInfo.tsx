import React from 'react'
import { withRouter } from 'react-router-dom'
import { BodyWrapper } from './AppBody'
import {
  useActiveProtocol,
  useDelegateInfo,
  useGovernanceToken,
  useAllProposals,
  useAllProposalStates,
  useUserDelegatee,
} from '../state/governance/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId, Token, JSBI } from '@uniswap/sdk'
import { GreyCard, OutlineCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import styled from 'styled-components'
import { RowBetween, AutoRow, RowFixed } from '../components/Row'
import { CheckCircle, XCircle, ChevronRight } from 'react-feather'
import { AutoColumn } from '../components/Column'
import EmptyProfile from '../assets/images/emptyprofile.png'
import {
  RoundedProfileImage,
  WrappedListLogo,
  ProposalStatusSmall,
  DelegateButton,
} from '../components/governance/styled'
import { getTwitterProfileLink, getEtherscanLink, shortenAddress, isAddress } from '../utils'
import { TYPE, ExternalLink, GreenIcon, RedIcon, StyledInternalLink, OnlyAboveSmall } from '../theme'
import { useIdentity, useTwitterProfileData, useAllIdentities } from '../state/social/hooks'
import { useTokenBalance } from '../state/wallet/hooks'
import Loader from '../components/Loader'
import { enumerateProposalState } from '../data/governance'
import CopyHelper from '../components/AccountDetails/Copy'
import { useIsEOA } from '../hooks/useIsEOA'
import { useIsAave } from '../hooks/useContract'
import { useToggleModal, useModalDelegatee } from '../state/application/hooks'
import { ApplicationModal } from '../state/application/actions'
import { BIG_INT_ZERO } from '../constants'
import useENS from '../hooks/useENS'
import { nameOrAddress } from '../utils/getName'

const ArrowWrapper = styled(StyledInternalLink)`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
  color: ${({ theme }) => theme.text1};

  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: none;
  }
  :hover {
    text-decoration: none;
    cursor: pointer;
  }
`

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
  `};
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg4};
  height: 1px;
`

const ResponsiveDataText = styled(TYPE.black)`
  font-size: 20px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

const ResponsiveBodyText = styled(TYPE.black)`
  font-size: 16px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

function localNumber(val: number) {
  return parseFloat(parseFloat(val.toString()).toFixed(0)).toLocaleString()
}

function DelegateInfo({
  match: {
    params: { protocolID, delegateAddress },
  },
}: RouteComponentProps<{ protocolID?: string; delegateAddress?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  const { chainId, account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  const formattedAddress = isAddress(delegateAddress)

  // get governance data and format amounts
  const delegateInfo = useDelegateInfo(delegateAddress)
  const delegatedVotes = delegateInfo ? (
    localNumber(delegateInfo.delegatedVotes)
  ) : delegateInfo === null ? (
    '0'
  ) : (
    <Loader />
  )

  const userDelegatee: string | undefined = useUserDelegatee(formattedAddress)

  const holdersRepresented = delegateInfo ? (
    localNumber(
      delegateInfo.tokenHoldersRepresentedAmount - (userDelegatee && userDelegatee === formattedAddress ? 1 : 0)
    )
  ) : delegateInfo === null ? (
    '0'
  ) : (
    <Loader />
  )

  const isEOA = useIsEOA(delegateAddress)

  // proposal data
  const proposalData = useAllProposals()
  const proposalStatuses = useAllProposalStates()

  // get gov token balance
  const govToken: Token | undefined = useGovernanceToken()
  const delegateTokenBalance = useTokenBalance(formattedAddress ? formattedAddress : undefined, govToken)

  // user gov data
  const isDelegatee =
    userDelegatee && delegateAddress ? userDelegatee.toLowerCase() === delegateAddress.toLowerCase() : false

  // don't show govToken balance for Aave until multi-token support implemented in Sybil
  const isAave = useIsAave()

  // get social data from Sybil list
  const identity = useIdentity(delegateAddress)
  const twitterHandle = identity?.twitter?.handle
  const twitterData = useTwitterProfileData(twitterHandle)
  const [allIdentities] = useAllIdentities()

  // ens name if they have it
  const ensName = useENS(formattedAddress ? formattedAddress : null)?.name

  const nameShortened = nameOrAddress(
    formattedAddress ? formattedAddress : undefined,
    allIdentities,
    true,
    delegateInfo?.autonomous,
    ensName
  )

  // toggle for showing delegation modal with prefilled delegate
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)
  const [, setPrefilledDelegate] = useModalDelegatee()

  // detect if they can delegate
  const userTokenBalance = useTokenBalance(account ?? undefined, govToken)
  const showDelegateButton = Boolean(userTokenBalance && JSBI.greaterThan(userTokenBalance.raw, BIG_INT_ZERO))

  // mainnet only
  if (chainId && chainId !== ChainId.MAINNET) {
    return (
      <BodyWrapper>
        <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
      </BodyWrapper>
    )
  }

  return (
    <BodyWrapper>
      {formattedAddress && chainId && delegateAddress ? (
        <AutoColumn gap="lg">
          <RowFixed style={{ width: '100%', height: '20px' }}>
            <ArrowWrapper to={'/delegates/' + activeProtocol?.id}>
              <TYPE.body fontSize="16px" fontWeight="600">
                Top Delegates
              </TYPE.body>
            </ArrowWrapper>
            <ChevronRight size={16} />

            <ExternalLink
              href={
                twitterHandle
                  ? getTwitterProfileLink(twitterHandle)
                  : getEtherscanLink(chainId, formattedAddress, 'address')
              }
            >
              <TYPE.black>{nameShortened}</TYPE.black>
            </ExternalLink>
          </RowFixed>
          <GreyCard>
            <RowBetween>
              <AutoRow gap="10px">
                {twitterData?.profileURL ? (
                  <RoundedProfileImage>
                    <img src={twitterData.profileURL} alt="profile" />
                  </RoundedProfileImage>
                ) : (
                  <WrappedListLogo src={EmptyProfile} />
                )}
                <AutoColumn gap="2px">
                  <RowFixed>
                    <ExternalLink
                      href={
                        twitterHandle
                          ? getTwitterProfileLink(twitterHandle)
                          : getEtherscanLink(chainId, formattedAddress, 'address')
                      }
                    >
                      <TYPE.black>
                        {nameShortened === formattedAddress ? ensName ?? formattedAddress : nameShortened}
                      </TYPE.black>
                    </ExternalLink>
                    {!twitterHandle && !delegateInfo?.autonomous && <CopyHelper toCopy={formattedAddress} />}
                  </RowFixed>
                  {twitterHandle || delegateInfo?.autonomous || nameShortened !== shortenAddress(delegateAddress) ? (
                    <RowFixed>
                      <ExternalLink href={getEtherscanLink(chainId, formattedAddress, 'address')}>
                        <TYPE.black fontSize="12px">{shortenAddress(delegateAddress)}</TYPE.black>
                      </ExternalLink>
                      <CopyHelper toCopy={formattedAddress} />
                    </RowFixed>
                  ) : (
                    <TYPE.black fontSize="12px">
                      {isEOA === true ? '👤 EOA' : isEOA === false && '📜 Smart Contract'}
                    </TYPE.black>
                  )}
                </AutoColumn>
              </AutoRow>
              <DelegateButton
                width="fit-content"
                disabled={!showDelegateButton || !account || isDelegatee}
                onClick={() => {
                  setPrefilledDelegate(delegateAddress)
                  toggelDelegateModal()
                }}
              >
                {isDelegatee ? 'Delegated' : 'Delegate'}
              </DelegateButton>
            </RowBetween>
          </GreyCard>
          <GreyCard>
            <DataRow>
              {!isAave && (
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">{`${activeProtocol?.token.symbol} Balance`}</TYPE.main>
                  <ResponsiveDataText>
                    {delegateTokenBalance ? delegateTokenBalance?.toFixed(0) : <Loader />}
                  </ResponsiveDataText>
                </AutoColumn>
              )}
              <AutoColumn gap="sm">
                <TYPE.main fontSize="14px">Votes</TYPE.main>
                <ResponsiveDataText>{delegatedVotes}</ResponsiveDataText>
              </AutoColumn>
              <OnlyAboveSmall>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">Token Holders Represented</TYPE.main>
                  <ResponsiveDataText>{holdersRepresented}</ResponsiveDataText>
                </AutoColumn>
              </OnlyAboveSmall>
            </DataRow>
          </GreyCard>
          <GreyCard>
            <AutoColumn gap="lg">
              <TYPE.main fontSize="16px">Voting History</TYPE.main>
              <Break />
              {delegateInfo && proposalStatuses && delegateInfo.votes ? (
                delegateInfo.votes
                  ?.map((vote, i) => {
                    const proposal = proposalData?.[vote.proposal]
                    // need to offset by one because proposal ids start at 1
                    const index = proposal ? parseFloat(proposal?.id) - 1 : 0
                    const status = proposalStatuses[index] ? enumerateProposalState(proposalStatuses[index]) : 'loading'
                    return (
                      proposal && (
                        <div key={i}>
                          <RowBetween key={i + proposal.id} style={{ alignItems: 'flex-start' }}>
                            <AutoColumn gap="sm" style={{ maxWidth: '500px' }} justify="flex-start">
                              <StyledInternalLink to={'/proposals/' + activeProtocol?.id + '/' + proposal.id}>
                                <ResponsiveBodyText style={{ maxWidth: '240px' }}>{proposal.title}</ResponsiveBodyText>
                              </StyledInternalLink>
                              {status && (
                                <RowFixed>
                                  <ProposalStatusSmall status={status}>{status}</ProposalStatusSmall>
                                </RowFixed>
                              )}
                            </AutoColumn>
                            <AutoColumn gap="sm" justify="flex-start" style={{ height: '100%' }}>
                              <RowFixed>
                                <ResponsiveBodyText mr="6px" ml="6px" textAlign="right">
                                  {`${localNumber(vote.votes)} votes ${vote.support ? 'in favor' : 'against'}`}
                                </ResponsiveBodyText>
                                {vote.support ? (
                                  <GreenIcon>
                                    <CheckCircle />
                                  </GreenIcon>
                                ) : (
                                  <RedIcon>
                                    <XCircle />
                                  </RedIcon>
                                )}
                              </RowFixed>
                            </AutoColumn>
                          </RowBetween>
                          {i !== 0 && <Break style={{ marginTop: '24px' }} />}
                        </div>
                      )
                    )
                  })
                  .reverse()
              ) : delegateInfo === null ? (
                <TYPE.body>No past votes</TYPE.body>
              ) : (
                <Loader />
              )}
              {delegateInfo && delegateInfo?.votes?.length === 0 && <TYPE.body>No past votes</TYPE.body>}
            </AutoColumn>
          </GreyCard>
        </AutoColumn>
      ) : (
        <Loader />
      )}
    </BodyWrapper>
  )
}

export default withRouter(DelegateInfo)
