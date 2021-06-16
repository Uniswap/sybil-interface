import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import { TabOption } from '../governance/Tabs'
import { Link, useLocation } from 'react-router-dom'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  margin-left: 70px;
  padding: 2rem;
  border-right: 1px solid ${({ backgroundColor }) => backgroundColor};

  ${({ theme }) => theme.mediaWidth.upToLarge`
    display: none;
  `};
`

export default function OverviewColumn() {
  const [activeProtocol] = useActiveProtocol()
  const location = useLocation()

  return (
    <Wrapper backgroundColor={activeProtocol?.secondaryColor}>
      <AutoColumn gap="md">
        <TYPE.main
          fontSize="24px"
          fontWeight="700"
          color={activeProtocol?.primaryColor}
          style={{ marginBottom: '1rem' }}
        >
          {activeProtocol?.name}
        </TYPE.main>
        <TabOption
          as={Link}
          to={'/delegates/' + activeProtocol?.id}
          selected={location.pathname.includes('delegates')}
          color={activeProtocol?.primaryColor}
          color2={activeProtocol?.secondaryColor}
        >
          Discover Delegates
        </TabOption>
        <TabOption
          as={Link}
          to={'/proposals/' + activeProtocol?.id}
          selected={location.pathname.includes('proposals')}
          color={activeProtocol?.primaryColor}
          color2={activeProtocol?.secondaryColor}
        >
          View Proposals
        </TabOption>
      </AutoColumn>
    </Wrapper>
  )
}
