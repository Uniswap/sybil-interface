import React, { useState, useRef } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useActiveProtocol } from '../../state/governance/hooks'
import { RowBetween, RowFixed } from '../Row'
import { WrappedListLogo } from './styled'
import { TYPE } from '../../theme'
import { ChevronDown } from 'react-feather'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import useOnClickOutside from '../../hooks/useClickOutside'

const Wrapper = styled.div<{ backgroundColor?: string; open: boolean }>`
  width: 100%;
  height: fit-content;
  position: relative;
  padding: 1rem;
  border-radius: 20px;
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'white'};
  z-index: 2;
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '20px')};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '20px')}
  :hover {
    cursor: pointer;
  }
`

// dont pass style props to DOM link element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Flyout = styled(({ backgroundColor, ...props }) => <Link {...props} />)`
  width: 100%;
  padding: 1rem;
  position: absolute;
  bottom: -68px;
  left: 0px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 10px 34px rgb(236 236 236 / 16%), 0 5px 6px rgb(140 140 140 / 23%);
  background-color: white;
  text-decoration: none;
`

export default function Dropdown() {
  const [activeProtocol] = useActiveProtocol()

  const [open, setOpen] = useState(false)

  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false))

  return (
    <Wrapper backgroundColor={activeProtocol?.secondaryColor} onClick={() => setOpen(!open)} open={open} ref={ref}>
      <RowBetween>
        <RowFixed>
          <WrappedListLogo src={activeProtocol?.logo} />
          <TYPE.mediumHeader color={activeProtocol?.primaryColor}>{activeProtocol?.name}</TYPE.mediumHeader>
        </RowFixed>
        <ChevronDown stroke={activeProtocol?.primaryColor} />
      </RowBetween>
      {open &&
        activeProtocol &&
        Object.keys(SUPPORTED_PROTOCOLS)
          .filter(k => SUPPORTED_PROTOCOLS[k].name !== activeProtocol.name)
          .map((k, i) => (
            <Flyout
              key={i}
              backgroundColor={SUPPORTED_PROTOCOLS[k].secondaryColor}
              to={`/delegates/${SUPPORTED_PROTOCOLS[k].id}`}
            >
              <RowBetween>
                <RowFixed>
                  <WrappedListLogo src={SUPPORTED_PROTOCOLS[k]?.logo} />
                  <TYPE.mediumHeader color={SUPPORTED_PROTOCOLS[k]?.primaryColor}>
                    {SUPPORTED_PROTOCOLS[k].name}
                  </TYPE.mediumHeader>
                </RowFixed>
              </RowBetween>
            </Flyout>
          ))}
    </Wrapper>
  )
}
