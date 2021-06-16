import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol, useFilterActive } from '../../state/governance/hooks'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import Card from '../Card'
import { TYPE } from '../../theme'
import { Link, useLocation } from 'react-router-dom'
import Toggle from '../Toggle'

export const TabOption = styled.button<{ selected?: boolean; color?: string; color2?: string }>`
  padding: 6px 12px;
  border-radius: 12px;
  outline: none;
  border: none;
  color: ${({ color, theme }) => color ?? theme.text1};
  background-color: ${({ selected, theme, color2 }) => (selected ? color2 ?? theme.bg3 : 'transparent')};
  text-decoration: none;
  font-weight: 500;

  :hover {
    cursor: pointer;
    background-color: ${({ theme, color2 }) => color2 ?? theme.bg3};
  }

  :focus {
    box-shadow: 0 0 0 1pt ${({ theme, color }) => color ?? theme.bg4};
  }
`

const AboveSmall = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

function Tabs() {
  const [activeProtocol] = useActiveProtocol()
  const [filter, setFilter] = useFilterActive()
  const location = useLocation()

  return (
    <Card padding="1rem 0">
      <RowBetween>
        <AutoRow gap="8px" width="fit-content">
          <TabOption
            as={Link}
            to={'/delegates/' + activeProtocol?.id}
            selected={location.pathname.includes('delegates')}
            color={activeProtocol?.primaryColor}
            color2={activeProtocol?.secondaryColor}
          >
            <TYPE.main color={activeProtocol?.primaryColor} fontSize={'16px'}>
              Delegates
            </TYPE.main>
          </TabOption>
          <TabOption
            as={Link}
            to={'/proposals/' + activeProtocol?.id}
            selected={location.pathname.includes('proposals')}
            color={activeProtocol?.primaryColor}
            color2={activeProtocol?.secondaryColor}
          >
            <TYPE.black fontSize={'16px'} color={activeProtocol?.primaryColor}>
              Proposals
            </TYPE.black>
          </TabOption>
        </AutoRow>
        {location.pathname.includes('delegates') && (
          <AboveSmall>
            <RowFixed>
              <Toggle isActive={filter} toggle={() => setFilter(!filter)} />
            </RowFixed>
          </AboveSmall>
        )}
      </RowBetween>
    </Card>
  )
}

export default Tabs
