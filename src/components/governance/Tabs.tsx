import React, { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import { AutoRow } from '../Row'
import { GreyCard } from '../Card'
import { TYPE } from '../../theme'
import { ActiveTab } from '../../pages/Governance'

const TabOption = styled.button<{ selected?: boolean }>`
  padding: 6px;
  border-radius: 12px;
  outline: none;
  border: none;
  background-color: ${({ selected, theme }) => (selected ? theme.bg3 : 'transparent')};

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg3};
  }

  :focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.bg4};
  }
`

export default function Tabs({
  activeTab,
  setActiveTab
}: {
  activeTab: ActiveTab
  setActiveTab: Dispatch<SetStateAction<ActiveTab>>
}) {
  const [activeProtocol] = useActiveProtocol()

  return (
    <GreyCard backgroundColor={activeProtocol?.secondaryColor} mb="1rem">
      <AutoRow gap="10px">
        <TabOption selected={activeTab === ActiveTab.DELEGATES} onClick={() => setActiveTab(ActiveTab.DELEGATES)}>
          <TYPE.black fontSize={'16px'}>Delegates</TYPE.black>
        </TabOption>
        <TabOption selected={activeTab === ActiveTab.PROPOSALS} onClick={() => setActiveTab(ActiveTab.PROPOSALS)}>
          <TYPE.black fontSize={'16px'}>Proposals</TYPE.black>
        </TabOption>
      </AutoRow>
    </GreyCard>
  )
}
