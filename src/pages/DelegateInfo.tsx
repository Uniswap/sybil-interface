import React from 'react'
import { BodyWrapper } from './AppBody'
import {
  useActiveProtocol,
  useDelegateInfo,
  useGovernanceToken,
  useAllProposals,
  useAllProposalStates
} from '../state/governance/hooks'
import { RouteComponentProps, Link } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId, Token } from '@uniswap/sdk'
import { WhiteCard, OutlineCard, GreyCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import styled from 'styled-components'
import { RowBetween, AutoRow, RowFixed } from '../components/Row'
import { ArrowLeft, CheckCircle, XCircle } from 'react-feather'
import { AutoColumn } from '../components/Column'
import EmptyProfile from '../assets/images/emptyprofile.png'
import { RoundedProfileImage, WrappedListLogo, ProposalStatusSmall } from '../components/governance/styled'
import { getTwitterProfileLink, getEtherscanLink, shortenAddress } from '../utils'
import TwitterIcon from '../assets/images/Twitter_Logo_Blue.png'
import { TYPE, ExternalLink, GreenIcon, RedIcon, StyledInternalLink, OnlyAboveSmall, OnlyBelowSmall } from '../theme'
import { useIdentityInfo, useTwitterProfileData } from '../state/social/hooks'
import { useTokenBalance } from '../state/wallet/hooks'
import Loader from '../components/Loader'
import { enumerateProposalState } from '../data/governance'
import CopyHelper from '../components/AccountDetails/Copy'
import { useIsEOA } from '../hooks/useIsEOA'

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

export default function DelegateInfo({
  match: {
    params: { protocolID, delegateAddress }
  }
}: RouteComponentProps<{ protocolID?: string; delegateAddress?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  const { chainId } = useActiveWeb3React()
  const [activeProtocol] = useActiveProtocol()

  // get governance data and format amounts
  const delegateInfo = useDelegateInfo(delegateAddress)
  const delegatedVotes = delegateInfo ? localNumber(delegateInfo.delegatedVotes) : '-'
  const holdersRepresented = delegateInfo ? localNumber(delegateInfo.tokenHoldersRepresentedAmount) : '-'

  const isEOA = useIsEOA(delegateAddress)

  // proposal data
  const proposalData = useAllProposals()
  const proposalStatuses = useAllProposalStates()

  // get gov token balance
  const govToken: Token | undefined = useGovernanceToken()
  const govTokenBalance = useTokenBalance(delegateAddress, govToken)

  // get social data from Sybil list
  const identityInfo = useIdentityInfo(delegateAddress)
  const twitterData = useTwitterProfileData(identityInfo?.twitter?.handle)

  // mainnet only
  if (chainId && chainId !== ChainId.MAINNET) {
    return <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
  }

  return (
    <BodyWrapper>
      <GreyCard>
        {delegateAddress && chainId ? (
          <AutoColumn gap="md">
            <RowBetween style={{ width: '100%' }}>
              <ArrowWrapper as={Link} to={'/delegates/' + activeProtocol?.id}>
                <ArrowLeft size={20} /> All Delegates
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
                            : getEtherscanLink(chainId, delegateAddress, 'address')
                        }
                      >
                        <OnlyAboveSmall>
                          <TYPE.black>
                            {identityInfo?.twitter?.handle ? `@${identityInfo.twitter.handle}` : delegateAddress}
                          </TYPE.black>
                        </OnlyAboveSmall>
                        <OnlyBelowSmall>
                          <TYPE.black>
                            {identityInfo?.twitter?.handle
                              ? `@${identityInfo.twitter.handle}`
                              : shortenAddress(delegateAddress)}
                          </TYPE.black>
                        </OnlyBelowSmall>
                      </ExternalLink>
                      {identityInfo?.twitter?.handle && <TwitterLogo src={TwitterIcon} />}
                      <CopyHelper toCopy={delegateAddress} />
                    </RowFixed>
                    {identityInfo?.twitter?.handle ? (
                      <RowFixed>
                        <ExternalLink href={getEtherscanLink(chainId, delegateAddress, 'address')}>
                          <TYPE.black fontSize="12px">{delegateAddress}</TYPE.black>
                        </ExternalLink>
                        <CopyHelper toCopy={delegateAddress} />
                      </RowFixed>
                    ) : (
                      <TYPE.black fontSize="12px">
                        {isEOA === true ? '👤 EOA' : isEOA === false && '📜 Smart Contract'}
                      </TYPE.black>
                    )}
                  </AutoColumn>
                </AutoRow>
                {/* <ButtonBlue width="100px">Delegate</ButtonBlue> */}
              </RowBetween>
            </WhiteCard>
            <WhiteCard>
              <DataRow>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">{`${activeProtocol?.token.symbol} Balance`}</TYPE.main>
                  <ResponsiveDataText>{govTokenBalance ? govTokenBalance?.toFixed(0) : '-'}</ResponsiveDataText>
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
                {proposalStatuses &&
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
                                <TYPE.body mr="6px">{`${localNumber(vote.votes)} votes ${
                                  vote.support ? 'in favor' : 'against'
                                }`}</TYPE.body>
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
                  })}
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
