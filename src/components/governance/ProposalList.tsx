import React from 'react'
import styled from 'styled-components'
import { ProposalData, useActiveProtocol, useAllProposalStates } from '../../state/governance/hooks'
import { EmptyWrapper, ProposalStatus, ProposalStatusSmall } from './styled'
import { TYPE, OnlyAboveSmall, OnlyBelowSmall } from '../../theme'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { Link } from 'react-router-dom'
import Loader, { LoadingRows } from '../Loader'
import { enumerateProposalState } from '../../data/governance'
import { BLOCKED_PROPOSALS_BY_START_BLOCK } from 'constants/proposals'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

const ProposalItem = styled.div`
  border-radius: 12px;
  padding: 1rem 0;
  margin: 1rem;
  text-decoration: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

const ResponsiveText = styled(TYPE.black)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
  height: 1px;
  margin: 0;
`

export default function ProposalList({ allProposals }: { allProposals: { [id: string]: ProposalData } | undefined }) {
  const [activeProtocol] = useActiveProtocol()

  const allStatuses = useAllProposalStates()

  return (
    <Wrapper>
      {allProposals && Object.keys(allProposals)?.length === 0 ? (
        <EmptyWrapper>
          <TYPE.body style={{ marginBottom: '8px' }}>No proposals found.</TYPE.body>
          <TYPE.subHeader>
            <i>Proposals submitted by community members will appear here.</i>
          </TYPE.subHeader>
        </EmptyWrapper>
      ) : (
        <AutoColumn gap="0">
          <TYPE.body fontSize="16px" fontWeight="600" mb="1rem">
            Proposals
          </TYPE.body>
          <Break />
          {allStatuses && allProposals && activeProtocol
            ? Object.values(allProposals)
                .map((p: ProposalData, i) => {
                  if (
                    BLOCKED_PROPOSALS_BY_START_BLOCK[activeProtocol.id] &&
                    BLOCKED_PROPOSALS_BY_START_BLOCK[activeProtocol.id].includes(p.startBlock)
                  ) {
                    return null
                  }
                  const status = allStatuses[i] ? enumerateProposalState(allStatuses[i]) : enumerateProposalState(0)
                  return (
                    <div key={i}>
                      <ProposalItem as={Link} to={activeProtocol?.id + '/' + p.id}>
                        <RowBetween>
                          <RowFixed>
                            <OnlyAboveSmall>
                              <TYPE.darkGray mr="8px">{p.id + '.'}</TYPE.darkGray>
                            </OnlyAboveSmall>
                            <ResponsiveText mr="10px">{p.title}</ResponsiveText>
                          </RowFixed>
                          <OnlyBelowSmall>
                            {allStatuses && allStatuses?.[i] ? (
                              <ProposalStatusSmall status={status}>{status}</ProposalStatusSmall>
                            ) : (
                              <Loader />
                            )}
                          </OnlyBelowSmall>
                          <OnlyAboveSmall>
                            {allStatuses && allStatuses?.[i] !== undefined ? (
                              <ProposalStatus status={status}>{status}</ProposalStatus>
                            ) : (
                              <Loader />
                            )}
                          </OnlyAboveSmall>
                        </RowBetween>
                      </ProposalItem>
                      <Break />
                    </div>
                  )
                })
                .reverse()
            : !allProposals &&
              !(allProposals && Object.keys(allProposals)?.length === 0) && (
                <LoadingRows>
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                  <div />
                </LoadingRows>
              )}
        </AutoColumn>
      )}
    </Wrapper>
  )
}
