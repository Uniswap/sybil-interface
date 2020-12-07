import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol, useFilterActive } from '../../state/governance/hooks'
import { AutoRow, RowBetween } from '../Row'
import { GreyCard } from '../Card'
import { TYPE } from '../../theme'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'
import Toggle from '../Toggle'

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

const AboveSmall = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

function Tabs({ location }: RouteComponentProps<{ location: string }>) {
  const [activeProtocol] = useActiveProtocol()
  const [filter, setFilter] = useFilterActive()

  return (
    <GreyCard backgroundColor={activeProtocol?.secondaryColor}>
      <RowBetween>
        <AutoRow gap="10px" width="fit-content">
          <TabOption
            as={Link}
            to={'/delegates/' + activeProtocol?.id}
            selected={location.pathname.includes('delegates')}
          >
            <TYPE.black fontSize={'16px'}>Delegates</TYPE.black>
          </TabOption>
          <TabOption
            as={Link}
            to={'/proposals/' + activeProtocol?.id}
            selected={location.pathname.includes('proposals')}
          >
            <TYPE.black fontSize={'16px'}>Proposals</TYPE.black>
          </TabOption>
        </AutoRow>
        <AboveSmall>
          {location.pathname.includes('delegates') && <Toggle isActive={filter} toggle={() => setFilter(!filter)} />}
        </AboveSmall>
      </RowBetween>
    </GreyCard>
  )
}

export default withRouter(Tabs)
