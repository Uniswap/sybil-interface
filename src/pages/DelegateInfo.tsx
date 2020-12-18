import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { BodyWrapper } from './AppBody'
import {
  useActiveProtocol,
  useDelegateInfo,
  useGovernanceToken,
  useAllProposals,
  useAllProposalStates
} from '../state/governance/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId, Token, JSBI } from '@uniswap/sdk'
import { WhiteCard, OutlineCard, GreyCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import styled from 'styled-components'
import { RowBetween, AutoRow, RowFixed } from '../components/Row'
import { ArrowLeft, CheckCircle, XCircle } from 'react-feather'
import { AutoColumn } from '../components/Column'
import EmptyProfile from '../assets/images/emptyprofile.png'
import {
  RoundedProfileImage,
  WrappedListLogo,
  ProposalStatusSmall,
  DelegateButton
} from '../components/governance/styled'
import { getTwitterProfileLink, getEtherscanLink, shortenAddress, isAddress } from '../utils'
import TwitterIcon from '../assets/images/Twitter_Logo_Blue.png'
import { TYPE, ExternalLink, GreenIcon, RedIcon, StyledInternalLink, OnlyAboveSmall, OnlyBelowSmall } from '../theme'
import { useIdentityInfo, useTwitterProfileData } from '../state/social/hooks'
import { useTokenBalance } from '../state/wallet/hooks'
import Loader from '../components/Loader'
import { enumerateProposalState } from '../data/governance'
import CopyHelper from '../components/AccountDetails/Copy'
import { useIsEOA } from '../hooks/useIsEOA'
import DelegateModal from '../components/vote/DelegateModal'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import { ApplicationModal } from '../state/application/actions'
import { BIG_INT_ZERO } from '../constants'

const ArrowWrapper = styled.div`
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

const TwitterLogo = styled.img`
  height: 24px;
  width: 24px;
  margin-left: 4px;
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
  background-color: ${({ theme }) => theme.bg3};
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
    params: { protocolID, delegateAddress }
  },
  history
}: RouteComponentProps<{ protocolID?: string; delegateAddress?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  const { chainId, account } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  const formattedAddress = isAddress(delegateAddress)

  // get governance data and format amounts
  const delegateInfo = useDelegateInfo(delegateAddress)
  const delegatedVotes = delegateInfo ? localNumber(delegateInfo.delegatedVotes) : <Loader />
  const holdersRepresented = delegateInfo ? localNumber(delegateInfo.tokenHoldersRepresentedAmount) : <Loader />

  const isEOA = useIsEOA(delegateAddress)

  // proposal data
  const proposalData = useAllProposals()
  const proposalStatuses = useAllProposalStates()

  // get gov token balance
  const govToken: Token | undefined = useGovernanceToken()
  const delegateTokenBalance = useTokenBalance(delegateAddress, govToken)

  // get social data from Sybil list
  const identityInfo = useIdentityInfo(delegateAddress)
  const twitterData = useTwitterProfileData(identityInfo?.twitter?.handle)

  // toggle for showing delegation modal with prefilled delegate
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE)
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)
  const [prefilledDelegate, setPrefilledDelegate] = useState<string | undefined>()

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
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={() => {
          setPrefilledDelegate(undefined)
          toggelDelegateModal()
        }}
        title="Delegate Votes"
        prefilledDelegate={prefilledDelegate}
      />
      <GreyCard>
        {formattedAddress && chainId ? (
          <AutoColumn gap="md">
            <RowBetween style={{ width: '100%' }}>
              <ArrowWrapper
                onClick={() => {
                  history?.length === 1 ? history.push('/') : history.goBack()
                }}
              >
                <ArrowLeft size={20} /> Back
              </ArrowWrapper>
            </RowBetween>
            <WhiteCard>
              <RowBetween>
                <AutoRow gap="10px">
                  {twitterData?.profileURL ? (
                    <RoundedProfileImage>
                      <img src={twitterData.profileURL} alt="profile" />
                    </RoundedProfileImage>
                  ) : (
                    <WrappedListLogo src={EmptyProfile} />
                  )}
                  <AutoColumn gap="sm">
                    <RowFixed>
                      <ExternalLink
                        href={
                          identityInfo?.twitter?.handle
                            ? getTwitterProfileLink(identityInfo?.twitter?.handle)
                            : getEtherscanLink(chainId, formattedAddress, 'address')
                        }
                      >
                        <OnlyAboveSmall>
                          <TYPE.black>
                            {identityInfo?.twitter?.handle ? `@${identityInfo.twitter.handle}` : formattedAddress}
                          </TYPE.black>
                        </OnlyAboveSmall>
                        <OnlyBelowSmall>
                          <TYPE.black>
                            {identityInfo?.twitter?.handle
                              ? `@${identityInfo.twitter.handle}`
                              : shortenAddress(formattedAddress ?? '')}
                          </TYPE.black>
                        </OnlyBelowSmall>
                      </ExternalLink>
                      {identityInfo?.twitter?.handle && <TwitterLogo src={TwitterIcon} />}
                      {!identityInfo?.twitter?.handle && <CopyHelper toCopy={formattedAddress} />}
                    </RowFixed>
                    {identityInfo?.twitter?.handle && delegateAddress ? (
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
                  disabled={!showDelegateButton || !account}
                  onClick={() => {
                    setPrefilledDelegate(delegateAddress)
                    toggelDelegateModal()
                  }}
                >
                  Delegate
                </DelegateButton>
              </RowBetween>
            </WhiteCard>
            <WhiteCard>
              <DataRow>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">{`${activeProtocol?.token.symbol} Balance`}</TYPE.main>
                  <ResponsiveDataText>
                    {delegateTokenBalance ? delegateTokenBalance?.toFixed(0) : <Loader />}
                  </ResponsiveDataText>
                </AutoColumn>
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
            </WhiteCard>
            <WhiteCard>
              <AutoColumn gap="lg">
                <TYPE.main fontSize="16px">Voting History</TYPE.main>
                <Break />
                {delegateInfo && proposalStatuses ? (
                  delegateInfo?.votes?.map((vote, i) => {
                    const proposal = proposalData?.[vote.proposal - 1] // proposals start at 1
                    const index = proposalStatuses.length - vote.proposal // offset based on reverse index
                    const status = proposalStatuses[index]
                      ? enumerateProposalState(proposalStatuses[index])
                      : enumerateProposalState(0)
                    return (
                      proposal && (
                        <div key={i}>
                          <RowBetween key={i + proposal.id}>
                            <AutoColumn gap="sm" style={{ maxWidth: '500px' }} justify="flex-start">
                              <StyledInternalLink to={'/proposals/' + activeProtocol?.id + '/' + proposal.id}>
                                <ResponsiveBodyText>{proposal.title}</ResponsiveBodyText>
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
                              <div> </div>
                            </AutoColumn>
                          </RowBetween>
                          {i !== delegateInfo?.votes.length - 1 && <Break style={{ margin: '1rem 0' }} />}
                        </div>
                      )
                    )
                  })
                ) : (
                  <Loader />
                )}
                {delegateInfo && delegateInfo?.votes?.length === 0 && <TYPE.body>No past votes</TYPE.body>}
              </AutoColumn>
            </WhiteCard>
          </AutoColumn>
        ) : (
          <Loader />
        )}
      </GreyCard>
    </BodyWrapper>
  )
}

export default withRouter(DelegateInfo)
