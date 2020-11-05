import React, { useEffect, useState } from 'react'
import { BodyWrapper } from '../AppBody'
import { GreyCard } from '../../components/Card'
import Column, { AutoColumn } from '../../components/Column'
import { TYPE, SolidSectionBreak } from '../../theme'
import { RowBetween } from '../../components/Row'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import { RouteComponentProps } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import Dropdown from '../../components/governance/Dropdown'
import DelegateList from '../../components/governance/DelegateList'
import Tabs from '../../components/governance/Tabs'
import Proposals from '../../components/governance/Proposals'
import AccountAttestation from '../../components/social'

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 340px 1fr;
  grid-gap: 1.5em;
`

export enum ActiveTab {
  DELEGATES,
  PROPOSALS
}

export default function Overview({
  match: {
    params: { protocolId }
  }
}: RouteComponentProps<{ protocolId: string }>) {
  const [, setActiveProtocol] = useActiveProtocol()

  const dispatch = useDispatch<AppDispatch>()
  useEffect(() => {
    if (Object.keys(SUPPORTED_PROTOCOLS).includes(protocolId)) {
      setActiveProtocol(SUPPORTED_PROTOCOLS[protocolId])
    }
  }, [dispatch, protocolId, setActiveProtocol])

  // set the active view
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.DELEGATES)

  return (
    <BodyWrapper>
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
        <Column>
          <Dropdown />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === ActiveTab.DELEGATES ? <DelegateList /> : <Proposals />}
        </Column>
      </SectionWrapper>
    </BodyWrapper>
  )
}
