import React from 'react'
import styled from 'styled-components'
import { ProposalData, useActiveProtocol } from '../../state/governance/hooks'
import { EmptyProposals, ProposalStatus } from './styled'
import { TYPE } from '../../theme'
import { GreyCard } from '../Card'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { Link } from 'react-router-dom'
import Loader from '../Loader'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
`

const ProposalItem = styled.div`
  border-radius: 12px;
  padding: 1rem;
  background-color: ${({ theme }) => theme.bg1};
  text-decoration: none;

  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function ProposalList({ allProposals }: { allProposals: ProposalData[] | undefined }) {
  const [activeProtocol] = useActiveProtocol()

  return (
    <Wrapper>
      <GreyCard>
        {allProposals?.length === 0 && (
          <EmptyProposals>
            <TYPE.body style={{ marginBottom: '8px' }}>No proposals found.</TYPE.body>
            <TYPE.subHeader>
              <i>Proposals submitted by community members will appear here.</i>
            </TYPE.subHeader>
          </EmptyProposals>
        )}
        <AutoColumn gap="1rem">
          {allProposals?.map((p: ProposalData, i) => {
            return (
              <ProposalItem key={i} as={Link} to={activeProtocol.id + '/' + p.id}>
                <RowBetween>
                  <RowFixed>
                    <TYPE.black mr="8px">{p.id}</TYPE.black>
                    <TYPE.black>{p.title}</TYPE.black>
                  </RowFixed>
                  {p.status ? <ProposalStatus status={p.status}>{p.status}</ProposalStatus> : <Loader />}
                </RowBetween>
              </ProposalItem>
            )
          })}
        </AutoColumn>
      </GreyCard>
    </Wrapper>
  )
}
