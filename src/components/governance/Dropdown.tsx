import React from 'react'
import styled from 'styled-components'
import { useActiveProtocol } from '../../state/governance/hooks'
import { RowBetween, RowFixed } from '../Row'
import { WrappedListLogo } from './styled'
import { TYPE } from '../../theme'
import { ChevronDown } from 'react-feather'

const Wrapper = styled.div<{ backgroundColor?: string }>`
  width: 100%;
  height: fit-content;
  position: relative;
  padding: 1rem;
  border-radius: 20px;
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'white'};
`

export default function Dropdown() {
  const [activeProtocol] = useActiveProtocol()

  return (
    <Wrapper backgroundColor={activeProtocol?.secondaryColor}>
      <RowBetween>
        <RowFixed>
          <WrappedListLogo src={activeProtocol?.logo} />
          <TYPE.mediumHeader color={activeProtocol?.primaryColor}>{activeProtocol?.name}</TYPE.mediumHeader>
        </RowFixed>
        <ChevronDown stroke={activeProtocol?.primaryColor} />
      </RowBetween>
    </Wrapper>
  )
}
