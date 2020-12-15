import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useProposalData, useActiveProtocol, useProposalStatus } from '../../state/governance/hooks'
import ReactMarkdown from 'react-markdown'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, ExternalLink } from '../../theme'
import { ArrowLeft } from 'react-feather'
import { ProposalStatus } from './styled'
import { DateTime } from 'luxon'
import { useTimestampFromBlock } from '../../hooks/useTimestampFromBlock'
import { PROPOSAL_LENGTH_IN_DAYS } from '../../constants'
import { isAddress, getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
import VoterList from './VoterList'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { BodyWrapper } from '../../pages/AppBody'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import { GreyCard } from '../Card'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  // width: 100%;
`

const ProposalInfo = styled(AutoColumn)`
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;

  ${({ theme }) => theme.mediaWidth.upToSmall`

  `};
`

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
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 400px;
  `};
`

function ProposalDetails({
  match: {
    params: { protocolID, proposalID }
  },
  history
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
  const startTimestamp: number | undefined = useTimestampFromBlock(proposalData?.startBlock)
  const endDate: DateTime | undefined = startTimestamp
    ? DateTime.fromSeconds(startTimestamp).plus({ days: PROPOSAL_LENGTH_IN_DAYS })
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

  // show links in propsoal details if content is an address
  // if content is contract with common name, replace address with common name
  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      return <ExternalLink href={getEtherscanLink(chainId, content, 'address')}>{content}</ExternalLink>
    }
    return <span>{content}</span>
  }

  return (
    <BodyWrapper>
      <Wrapper>
        <GreyCard padding="0">
          <ProposalInfo gap="lg" justify="start">
            <RowBetween style={{ width: '100%' }}>
              <ArrowWrapper
                onClick={() => {
                  history?.length === 2 ? history.push('/') : history.goBack()
                }}
              >
                <ArrowLeft size={20} /> Back
              </ArrowWrapper>
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
                    voters={proposalData?.forVotes}
                    support="for"
                    id={proposalData?.id}
                  />
                  <VoterList
                    title="Against"
                    amount={proposalData?.againstCount}
                    percentage={againstPercentage}
                    voters={proposalData?.againstVotes}
                    support={'against'}
                    id={proposalData?.id}
                  />
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
              <TYPE.mediumHeader fontWeight={600}>Description</TYPE.mediumHeader>
              <MarkDownWrapper>
                <ReactMarkdown source={proposalData?.description} />
              </MarkDownWrapper>
            </AutoColumn>
            <AutoColumn gap="md">
              <TYPE.mediumHeader fontWeight={600}>Proposer</TYPE.mediumHeader>
              <ExternalLink
                href={
                  proposalData?.proposer && chainId ? getEtherscanLink(chainId, proposalData?.proposer, 'address') : ''
                }
              >
                <MarkDownWrapper>
                  <DetailText>
                    <ReactMarkdown source={proposalData?.proposer} />
                  </DetailText>
                </MarkDownWrapper>
              </ExternalLink>
            </AutoColumn>
          </ProposalInfo>
        </GreyCard>
      </Wrapper>
    </BodyWrapper>
  )
}

export default withRouter(ProposalDetails)
