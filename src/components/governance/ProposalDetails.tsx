import React from 'react'
import styled from 'styled-components'
import { useProposalData } from '../../state/governance/hooks'
import ReactMarkdown from 'react-markdown'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, ExternalLink } from '../../theme'
import { ArrowLeft } from 'react-feather'
import { ProposalStatus } from './styled'
import { DateTime } from 'luxon'
import { useTimestampFromBlock } from '../../hooks/useTimestampFromBlock'
import { PROPOSAL_LENGTH_IN_DAYS } from '../../constants'
import { isAddress, getEtherscanLink, shortenAddress } from '../../utils'
import { useActiveWeb3React } from '../../hooks'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

const ProposalInfo = styled(AutoColumn)`
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  width: 100%;
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
`

const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #2172e5 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: fit-content;
  z-index: 2;
`

const ProgressWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`

const Progress = styled.div<{ status: 'for' | 'against'; percentageString?: string }>`
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme, status }) => (status === 'for' ? theme.green1 : theme.red1)};
  width: ${({ percentageString }) => percentageString};
`

const MarkDownWrapper = styled.div`
  overflow: hidden;
`

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
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

const TopVoterWrapper = styled.div`
  padding: 1rem 0 0 0;
`

export default function ProposalDetails({ id, onBack }: { id: string; onBack: () => void }) {
  const { chainId } = useActiveWeb3React()

  const proposalData = useProposalData(id)

  // get and format data
  const startTimestamp: number | undefined = useTimestampFromBlock(proposalData?.startBlock)
  const endDate: DateTime | undefined = startTimestamp
    ? DateTime.fromSeconds(startTimestamp).plus({ days: PROPOSAL_LENGTH_IN_DAYS })
    : undefined
  const now: DateTime = DateTime.local()

  // get total votes and format percentages for UI
  const totalVotes: number | undefined = proposalData ? proposalData.forCount + proposalData.againstCount : undefined
  const forPercentage: string =
    proposalData && totalVotes ? ((proposalData.forCount * 100) / totalVotes).toFixed(0) + '%' : '0%'
  const againstPercentage: string =
    proposalData && totalVotes ? ((proposalData.againstCount * 100) / totalVotes).toFixed(0) + '%' : '0%'

  // show links in propsoal details if content is an address
  // if content is contract with common name, replace address with common name
  const linkIfAddress = (content: string) => {
    if (isAddress(content) && chainId) {
      // const commonName = COMMON_CONTRACT_NAMES[content] ?? content
      return <ExternalLink href={getEtherscanLink(chainId, content, 'address')}>{content}</ExternalLink>
    }
    return <span>{content}</span>
  }

  return (
    <Wrapper>
      <ProposalInfo gap="lg" justify="start">
        <RowBetween style={{ width: '100%' }}>
          <ArrowWrapper onClick={onBack}>
            <ArrowLeft size={20} /> All Proposals
          </ArrowWrapper>
          {proposalData && <ProposalStatus status={proposalData?.status ?? ''}>{proposalData?.status}</ProposalStatus>}
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
          <StyledDataCard>
            <CardSection>
              <AutoColumn gap="md">
                <WrapSmall>
                  <TYPE.black fontWeight={600}>For</TYPE.black>
                  <TYPE.black fontWeight={600}>
                    {proposalData?.forCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TYPE.black>
                </WrapSmall>
              </AutoColumn>
              <ProgressWrapper>
                <Progress status={'for'} percentageString={forPercentage} />
              </ProgressWrapper>
              <TopVoterWrapper>
                <AutoColumn gap="1rem">
                  <RowBetween>
                    <TYPE.main fontWeight={400} fontSize="14px">
                      Top Voters
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  {proposalData?.forVotes?.map((p, i) => {
                    return (
                      <RowBetween key={'vote-for-' + i}>
                        <TYPE.black fontWeight={400} fontSize="14px">
                          {shortenAddress(p.voter.id)}
                        </TYPE.black>
                        <TYPE.black fontWeight={400} fontSize="14px">
                          {parseFloat(p.votes).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TYPE.black>
                      </RowBetween>
                    )
                  })}
                  <TYPE.black fontWeight={600} fontSize="14px" textAlign="center">
                    View All
                  </TYPE.black>
                </AutoColumn>
              </TopVoterWrapper>
            </CardSection>
          </StyledDataCard>
          <StyledDataCard>
            <CardSection>
              <AutoColumn gap="md">
                <WrapSmall>
                  <TYPE.black fontWeight={600}>Against</TYPE.black>
                  <TYPE.black fontWeight={600}>
                    {proposalData?.againstCount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TYPE.black>
                </WrapSmall>
              </AutoColumn>
              <ProgressWrapper>
                <Progress status={'against'} percentageString={againstPercentage} />
              </ProgressWrapper>
              <TopVoterWrapper>
                <AutoColumn gap="1rem">
                  <RowBetween>
                    <TYPE.main fontWeight={400} fontSize="14px">
                      Top Voters
                    </TYPE.main>
                    <div />
                  </RowBetween>
                  {proposalData?.againstVotes?.map((p, i) => {
                    return (
                      <RowBetween key={'vote-for-' + i}>
                        <TYPE.black fontWeight={400} fontSize="14px">
                          {shortenAddress(p.voter.id)}
                        </TYPE.black>
                        <TYPE.black fontWeight={400} fontSize="14px">
                          {parseFloat(p.votes).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TYPE.black>
                      </RowBetween>
                    )
                  })}
                  <TYPE.black fontWeight={600} fontSize="14px" textAlign="center">
                    View All
                  </TYPE.black>
                </AutoColumn>
              </TopVoterWrapper>
            </CardSection>
          </StyledDataCard>
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
            href={proposalData?.proposer && chainId ? getEtherscanLink(chainId, proposalData?.proposer, 'address') : ''}
          >
            <ReactMarkdown source={proposalData?.proposer} />
          </ExternalLink>
        </AutoColumn>
      </ProposalInfo>
    </Wrapper>
  )
}
