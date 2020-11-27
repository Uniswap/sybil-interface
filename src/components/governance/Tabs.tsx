import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import { AutoRow } from '../Row'
import { GreyCard } from '../Card'
import { TYPE } from '../../theme'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'

const TabOption = styled.button<{ selected?: boolean }>`
  padding: 6px;
  border-radius: 12px;
  outline: none;
  border: none;
  background-color: ${({ selected, theme }) => (selected ? theme.bg3 : 'transparent')};
  text-decoration: none;

  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg3};
  }

  :focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => theme.bg4};
  }
`

function Tabs({ location }: RouteComponentProps<{ location: string }>) {
  const [activeProtocol] = useActiveProtocol()

  return (
    <GreyCard backgroundColor={activeProtocol?.secondaryColor}>
      <AutoRow gap="10px">
        <TabOption as={Link} to={'/delegates/' + activeProtocol?.id} selected={location.pathname.includes('delegates')}>
          <TYPE.black fontSize={'16px'}>Delegates</TYPE.black>
        </TabOption>
        <TabOption as={Link} to={'/proposals/' + activeProtocol?.id} selected={location.pathname.includes('proposals')}>
          <TYPE.black fontSize={'16px'}>Proposals</TYPE.black>
        </TabOption>
      </AutoRow>
    </GreyCard>
  )
}

export default withRouter(Tabs)
