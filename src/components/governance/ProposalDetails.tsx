import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useProposalData, useActiveProtocol, useProposalStatus, useUserVotes } from '../../state/governance/hooks'
import ReactMarkdown from 'react-markdown'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, ExternalLink } from '../../theme'
import { ChevronRight } from 'react-feather'
import { ProposalStatus } from './styled'
import { DateTime } from 'luxon'
import { AVERAGE_BLOCK_TIME_IN_SECS, BIG_INT_ZERO } from '../../constants'
import { isAddress, getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import VoterList from './VoterList'
import VoteModal from '../vote/VoteModal'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { BodyWrapper } from '../../pages/AppBody'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'
import { ApplicationModal } from '../../state/application/actions'
import { useBlockNumber, useModalOpen, useToggleModal } from '../../state/application/hooks'
import { BigNumber } from 'ethers'
import { nameOrAddress } from '../../utils/getName'
import { useAllIdentities } from '../../state/social/hooks'
import { ButtonError } from '../../components/Button'

const Wrapper = styled.div<{ backgroundColor?: string }>``

const ProposalInfo = styled(AutoColumn)`
  border-radius: 12px;
  position: relative;
`

const ArrowWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr;
    margin: 0;
    padding: 0;
  `};
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

const DetailText = styled.div`
  word-break: break-all;
`

const MarkDownWrapper = styled.div`
  overflow: scroll;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 400px;
  `};
`

const AddressWrapper = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 300px;
  `};
`

function ProposalDetails({
  match: {
    params: { protocolID, proposalID },
  },
  history,
}: RouteComponentProps<{ protocolID: string; proposalID: string }>) {
  const { chainId } = useActiveWeb3React()

  // if valid protocol id passed in, update global active protocol
  const dispatch = useDispatch<AppDispatch>()
  const [, setActiveProtocol] = useActiveProtocol()
  useEffect(() => {
    if (protocolID && Object.keys(SUPPORTED_PROTOCOLS).includes(protocolID)) {
      setActiveProtocol(SUPPORTED_PROTOCOLS[protocolID])
    }
  }, [dispatch, protocolID, setActiveProtocol])

  const proposalData = useProposalData(proposalID)
  const status = useProposalStatus(proposalID) // @TODO shoudlnt use spearate data for this

  // get and format data
  const currentTimestamp = useCurrentBlockTimestamp()
  const currentBlock = useBlockNumber()
  const endDate: DateTime | undefined =
    proposalData && currentTimestamp && currentBlock
      ? DateTime.fromSeconds(
          currentTimestamp
            .add(BigNumber.from(AVERAGE_BLOCK_TIME_IN_SECS).mul(BigNumber.from(proposalData.endBlock - currentBlock)))
            .toNumber()
        )
      : undefined
  const now: DateTime = DateTime.local()

  // get total votes and format percentages for UI
  const totalVotes: number | undefined =
    proposalData?.forCount !== undefined && proposalData?.againstCount !== undefined
      ? proposalData.forCount + proposalData.againstCount
      : undefined

  const forPercentage: string =
    proposalData?.forCount !== undefined && totalVotes
      ? ((proposalData.forCount * 100) / totalVotes).toFixed(0) + '%'
      : '0%'

  const againstPercentage: string =
    proposalData?.againstCount !== undefined && totalVotes
      ? ((proposalData.againstCount * 100) / totalVotes).toFixed(0) + '%'
      : '0%'

  const [allIdentities] = useAllIdentities()

  // show links in propsoal details if content is an address
  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      return (
        <ExternalLink href={getEtherscanLink(chainId, content, 'address')}>
          {nameOrAddress(content, allIdentities)}
        </ExternalLink>
      )
    }
    return <span>{nameOrAddress(content, allIdentities)}</span>
  }
  const [support, setSupport] = useState(false)
  const toggleVoteModal = useToggleModal(ApplicationModal.VOTE)
  const voteModalOpen = useModalOpen(ApplicationModal.VOTE)
  const voteModelToggle = useToggleModal(ApplicationModal.VOTE)

  const userAvailableVotes = useUserVotes()
  // only show voting if user has > 0 votes at proposal start block and proposal is active,
  const showVotingButtons =
    userAvailableVotes &&
    userAvailableVotes.greaterThan(BIG_INT_ZERO) &&
    proposalData &&
    proposalData.status === 'active'

  return (
    <BodyWrapper>
      <VoteModal
        isOpen={voteModalOpen}
        onDismiss={voteModelToggle}
        support={support}
        proposalId={proposalID}
        proposalTitle={proposalData?.title}
      />
      <Wrapper>
        <ProposalInfo gap="lg" justify="start">
          <RowBetween style={{ width: '100%', alignItems: 'flex-start' }}>
            <RowFixed>
              <ArrowWrapper
                onClick={() => {
                  history?.length === 1 ? history.push('/') : history.goBack()
                }}
                style={{ alignItems: 'flex-start' }}
              >
                <TYPE.body fontWeight="600">Proposals</TYPE.body>
              </ArrowWrapper>
              <ChevronRight size={16} />
              <TYPE.body>{'Proposal #' + proposalID}</TYPE.body>
            </RowFixed>

            {proposalData && <ProposalStatus status={status ?? ''}>{status}</ProposalStatus>}
          </RowBetween>
          <AutoColumn gap="10px" style={{ width: '100%' }}>
            <TYPE.largeHeader style={{ marginBottom: '.5rem' }}>{proposalData?.title}</TYPE.largeHeader>
            <RowBetween>
              <TYPE.main>
                {endDate && endDate < now
                  ? 'Voting ended ' + (endDate && endDate.toLocaleString(DateTime.DATETIME_FULL))
                  : proposalData
                  ? 'Voting ends approximately ' + (endDate && endDate.toLocaleString(DateTime.DATETIME_FULL))
                  : ''}
              </TYPE.main>
            </RowBetween>
          </AutoColumn>
          <CardWrapper>
            {proposalData && (
              <>
                <VoterList
                  title="For"
                  amount={proposalData?.forCount}
                  percentage={forPercentage}
                  voters={proposalData?.forVotes.slice(0, Math.min(10, Object.keys(proposalData?.forVotes)?.length))}
                  support="for"
                  id={proposalData?.id}
                />
                <VoterList
                  title="Against"
                  amount={proposalData?.againstCount}
                  percentage={againstPercentage}
                  voters={proposalData?.againstVotes.slice(
                    0,
                    Math.min(10, Object.keys(proposalData?.againstVotes)?.length)
                  )}
                  support={'against'}
                  id={proposalData?.id}
                />
              </>
            )}
            {showVotingButtons && (
              <>
                <ButtonError
                  style={{ flexGrow: 1, fontSize: 16, padding: '8px 12px', width: 'unset' }}
                  onClick={() => {
                    setSupport(true)
                    toggleVoteModal()
                  }}
                >
                  Support Proposal
                </ButtonError>
                <ButtonError
                  error
                  style={{ flexGrow: 1, fontSize: 16, padding: '8px 12px', width: 'unset' }}
                  onClick={() => {
                    setSupport(false)
                    toggleVoteModal()
                  }}
                >
                  Reject Proposal
                </ButtonError>
              </>
            )}
          </CardWrapper>
          <AutoColumn gap="md">
            <TYPE.mediumHeader fontWeight={600}>Details</TYPE.mediumHeader>
            {proposalData?.details?.map((d, i) => {
              return (
                <DetailText key={i}>
                  {i + 1}: {linkIfAddress(d.target)}.{d.functionSig}(
                  {d.callData.split(',').map((content, i) => {
                    return (
                      <span key={i}>
                        {linkIfAddress(content)}
                        {d.callData.split(',').length - 1 === i ? '' : ','}
                      </span>
                    )
                  })}
                  )
                </DetailText>
              )
            })}
          </AutoColumn>
          <AutoColumn gap="md">
            <MarkDownWrapper>
              <ReactMarkdown source={proposalData?.description} disallowedTypes={['code']} />
            </MarkDownWrapper>
          </AutoColumn>
          <AutoColumn gap="md">
            <TYPE.mediumHeader fontWeight={600}>Proposer</TYPE.mediumHeader>
            <AddressWrapper>
              <ExternalLink
                href={
                  proposalData?.proposer && chainId ? getEtherscanLink(chainId, proposalData?.proposer, 'address') : ''
                }
                style={{ wordWrap: 'break-word' }}
              >
                <TYPE.blue fontWeight={500}>{nameOrAddress(proposalData?.proposer, allIdentities)}</TYPE.blue>
              </ExternalLink>
            </AddressWrapper>
          </AutoColumn>
        </ProposalInfo>
      </Wrapper>
    </BodyWrapper>
  )
}

export default withRouter(ProposalDetails)
