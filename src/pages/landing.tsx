import React from 'react'
import { BodyWrapper } from './AppBody'
import AccountAttestation from '../components/AccountAttestation'
import GovernanceList from '../components/GovernanceList'
import ProjectSelector from '../components/GovernanceList/ProjectSelector'
import { GreyCard } from '../components/Card'
import { AutoColumn } from '../components/Column'
import { TYPE, SolidSectionBreak } from '../theme'
import { RowBetween } from '../components/Row'
import styled from 'styled-components'

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-gap: 1.5em;
`

export default function Home() {
  return (
    <BodyWrapper>
      <AutoColumn gap="lg">
        <ProjectSelector />
        <SectionWrapper>
          <AutoColumn gap="lg" style={{ height: 'fit-content' }}>
            <AccountAttestation />
            <GreyCard>
              <AutoColumn gap="lg">
                <RowBetween>
                  <TYPE.mediumHeader>How it works</TYPE.mediumHeader>
                  <TYPE.mediumHeader>?</TYPE.mediumHeader>
                </RowBetween>
                <SolidSectionBreak />
                <AutoColumn gap="md">
                  <TYPE.black>
                    This tool connects a wallet address to a digital identity by singing a message on chain.
                  </TYPE.black>
                  <TYPE.black>
                    The mapping of address ↔ identity can be updated, removed and queried on chain using any ethereum
                    indexer.
                  </TYPE.black>
                  <TYPE.black>
                    This mapping can be used for displaying public identies for governance platforms on ethereum.
                  </TYPE.black>
                </AutoColumn>
              </AutoColumn>
            </GreyCard>
          </AutoColumn>
          <AutoColumn gap="lg">
            <GovernanceList />
          </AutoColumn>
        </SectionWrapper>
      </AutoColumn>
    </BodyWrapper>
  )
}
