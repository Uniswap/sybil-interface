import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol, useFilterActive } from '../../state/governance/hooks'
import { AutoRow, RowBetween, RowFixed } from '../Row'
import { GreyCard } from '../Card'
import { TYPE } from '../../theme'
import { Link, useLocation } from 'react-router-dom'
import Toggle from '../Toggle'

const TabOption = styled.button<{ selected?: boolean }>`
  padding: 6px 12px;
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

// const StyledCheckbox = styled.input`
//   border: 1px solid ${({ theme }) => theme.bg1};
//   height: 20px;
//   color: ${({ theme }) => theme.text1};
// `

function Tabs() {
  const [activeProtocol] = useActiveProtocol()
  const [filter, setFilter] = useFilterActive()

  const location = useLocation()

  return (
    <GreyCard backgroundColor={activeProtocol?.secondaryColor}>
      <RowBetween>
        <AutoRow gap="8px" width="fit-content">
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
        {location.pathname.includes('delegates') && (
          <AboveSmall>
            <RowFixed>
              {/* <StyledCheckbox
                type="checkbox"
                checked={hideZero}
                onChange={() => setHideZero && setHideZero(!hideZero)}
              />
              <TYPE.main mr="10px" onClick={() => setHideZero && setHideZero(!hideZero)} style={{ cursor: 'pointer' }}>
                Hide 0 votes
              </TYPE.main> */}
              <Toggle isActive={filter} toggle={() => setFilter(!filter)} />
            </RowFixed>
          </AboveSmall>
        )}
      </RowBetween>
    </GreyCard>
  )
}

export default Tabs
