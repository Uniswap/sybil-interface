import React, { useEffect, useState } from 'react'
import { BodyWrapper } from '../AppBody'
import { AutoColumn } from '../../components/Column'
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
import GovernanceAccountSection from '../../components/governanceAccount'

const SectionWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
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
        <AutoColumn gap="1rem">
          <Dropdown />
          <GovernanceAccountSection />
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          {activeTab === ActiveTab.DELEGATES ? <DelegateList /> : <Proposals />}
        </AutoColumn>
      </SectionWrapper>
    </BodyWrapper>
  )
}
