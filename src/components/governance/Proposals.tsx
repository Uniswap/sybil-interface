import React, { useState } from 'react'
import styled from 'styled-components'
import { useAllProposals, ProposalData } from '../../state/governance/hooks'
import { EmptyProposals, ProposalStatus } from './styled'
import { TYPE } from '../../theme'
import { GreyCard } from '../Card'
import ProposalDetails from './ProposalDetails'
import { RowBetween, RowFixed } from '../Row'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

const ProposalItem = styled.div`
  border-radius: 12px;
  padding: 1rem;
  background-color: ${({ theme }) => theme.bg1};

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function Proposals() {
  const allProposals = useAllProposals()

  const [shownProposal, setShownProposal] = useState<string | undefined>('1')

  return (
    <Wrapper>
      <GreyCard>
        {shownProposal && <ProposalDetails id={shownProposal} onBack={() => setShownProposal(undefined)} />}
        {!shownProposal && allProposals?.length === 0 && (
          <EmptyProposals>
            <TYPE.body style={{ marginBottom: '8px' }}>No proposals found.</TYPE.body>
            <TYPE.subHeader>
              <i>Proposals submitted by community members will appear here.</i>
            </TYPE.subHeader>
          </EmptyProposals>
        )}
        {!shownProposal &&
          allProposals?.map((p: ProposalData, i) => {
            return (
              <ProposalItem key={i} onClick={() => setShownProposal(p.id)}>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black mr="8px">{p.id}</TYPE.black>
                    <TYPE.black>{p.title}</TYPE.black>
                  </RowFixed>
                  <ProposalStatus status={p.status}>{p.status}</ProposalStatus>
                </RowBetween>
              </ProposalItem>
            )
          })}
      </GreyCard>
    </Wrapper>
  )
}
