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
import { getTwitterProfileLink, getEtherscanLink } from '../utils'
import TwitterIcon from '../assets/images/Twitter_Logo_Blue.png'
import { TYPE, ExternalLink, GreenIcon, RedIcon, StyledInternalLink } from '../theme'
import { useIdentityInfo, useTwitterProfileData } from '../state/social/hooks'
import { useTokenBalance } from '../state/wallet/hooks'
import Loader from '../components/Loader'
import { enumerateProposalState } from '../data/governance'

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
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
  height: 1px;
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
          <AutoColumn gap="lg">
            <RowBetween style={{ width: '100%' }}>
              <ArrowWrapper as={Link} to={'/delegates/' + activeProtocol?.id}>
                <ArrowLeft size={20} /> All Delegates
              </ArrowWrapper>
            </RowBetween>
            <WhiteCard>
              <AutoRow gap="10px">
                {twitterData?.profileURL ? (
                  <RoundedProfileImage>
                    <img src={twitterData.profileURL} alt="profile" />
                  </RoundedProfileImage>
                ) : (
                  <WrappedListLogo src={EmptyProfile} />
                )}
                <AutoColumn gap="md">
                  <RowFixed>
                    <ExternalLink
                      href={
                        identityInfo?.twitter?.handle
                          ? getTwitterProfileLink(identityInfo?.twitter?.handle)
                          : getEtherscanLink(chainId, delegateAddress, 'address')
                      }
                    >
                      <TYPE.black>
                        {identityInfo?.twitter?.handle ? `@${identityInfo.twitter.handle}` : delegateAddress}
                      </TYPE.black>
                    </ExternalLink>
                    {identityInfo?.twitter?.handle && <TwitterLogo src={TwitterIcon} />}
                  </RowFixed>
                  {identityInfo?.twitter?.handle ? (
                    <ExternalLink href={getEtherscanLink(chainId, delegateAddress, 'address')}>
                      <TYPE.black fontSize="12px">{delegateAddress}</TYPE.black>
                    </ExternalLink>
                  ) : (
                    <TYPE.black fontSize="12px">
                      {delegateInfo?.EOA === true ? '👤 EOA' : delegateInfo?.EOA === false && '📜 Smart Contract'}
                    </TYPE.black>
                  )}
                </AutoColumn>
              </AutoRow>
            </WhiteCard>
            <WhiteCard>
              <DataRow>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">{`${activeProtocol?.token.symbol} Balance`}</TYPE.main>
                  <TYPE.black fontSize="20px">{govTokenBalance ? govTokenBalance?.toFixed(0) : '-'}</TYPE.black>
                </AutoColumn>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">Votes</TYPE.main>
                  <TYPE.black fontSize="20px">{delegatedVotes}</TYPE.black>
                </AutoColumn>
                <AutoColumn gap="sm">
                  <TYPE.main fontSize="14px">Token Holders Represented</TYPE.main>
                  <TYPE.black fontSize="20px">{holdersRepresented}</TYPE.black>
                </AutoColumn>
              </DataRow>
            </WhiteCard>
            <WhiteCard>
              <AutoColumn gap="lg">
                <TYPE.main fontSize="16px">Voting History</TYPE.main>
                <Break />
                {proposalStatuses &&
                  delegateInfo?.votes?.map((vote, i) => {
                    const proposal = proposalData?.[vote.proposal - 1]
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
                                <TYPE.black>{proposal.title}</TYPE.black>
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
