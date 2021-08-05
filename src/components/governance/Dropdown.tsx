import React, { useState, useRef, useMemo } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useActiveProtocol } from '../../state/governance/hooks'
import { RowBetween, RowFixed } from '../Row'
import { WrappedListLogo } from './styled'
import { TYPE } from '../../theme'
import { ChevronDown, ChevronUp } from 'react-feather'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'
import useOnClickOutside from '../../hooks/useClickOutside'

const Wrapper = styled.div<{ backgroundColor?: string; open: boolean }>`
  width: 100%;
  height: fit-content;
  position: relative;
  padding: 1rem;
  border-radius: 20px;
  user-select: none;
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'white'};
  z-index: 3;
  border-bottom-left-radius: ${({ open }) => (open ? '0px' : '20px')};
  border-bottom-right-radius: ${({ open }) => (open ? '0px' : '20px')}
  :hover {
    cursor: pointer;
  }
`

const Flyout = styled.div<{ options: number }>`
  background-color: white;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  bottom: -${({ options }) => options * 72}px;
  box-shadow: 0 10px 34px rgb(236 236 236 / 16%), 0 5px 6px rgb(140 140 140 / 23%);
  left: 0px;
  overflow: hidden;
  position: absolute;
  width: 100%;
  z-index: 3;

  @media (max-width: 720px) {
    bottom: -${({ options }) => options * 64}px;
  }
`

// dont pass style props to DOM link element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Option = styled(({ backgroundColor, ...props }) => <Link {...props} />)`
  background-color: ${({ backgroundColor }) => backgroundColor ?? 'white'};
  display: block;
  padding: 1rem;
  text-decoration: none;
  :hover {
    font-weight: bold;
  }
`

const ResponsiveText = styled(TYPE.mediumHeader)`
  @media (max-width: 720px) {
    font-size: 16px !important;
  }
`

export default function Dropdown() {
  const [activeProtocol] = useActiveProtocol()

  const [open, setOpen] = useState(false)

  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false))

  const options = useMemo(() => {
    return activeProtocol
      ? Object.keys(SUPPORTED_PROTOCOLS)
          .filter((k) => SUPPORTED_PROTOCOLS[k].name !== activeProtocol.name)
          .map((k, i) => (
            <Option
              key={i}
              backgroundColor={SUPPORTED_PROTOCOLS[k].secondaryColor}
              to={`/delegates/${SUPPORTED_PROTOCOLS[k].id}`}
            >
              <RowBetween>
                <RowFixed style={{ gap: '16px' }}>
                  <WrappedListLogo src={SUPPORTED_PROTOCOLS[k]?.logo} />
                  <ResponsiveText color={SUPPORTED_PROTOCOLS[k]?.primaryColor}>
                    {SUPPORTED_PROTOCOLS[k].name}
                  </ResponsiveText>
                </RowFixed>
              </RowBetween>
            </Option>
          ))
      : []
  }, [activeProtocol])

  return (
    <Wrapper backgroundColor={activeProtocol?.secondaryColor} onClick={() => setOpen(!open)} open={open} ref={ref}>
      <RowBetween>
        <RowFixed style={{ gap: '16px' }}>
          <WrappedListLogo src={activeProtocol?.logo} />
          <ResponsiveText color={activeProtocol?.primaryColor}>{activeProtocol?.name}</ResponsiveText>
        </RowFixed>
        {open ? (
          <ChevronUp stroke={activeProtocol?.primaryColor} />
        ) : (
          <ChevronDown stroke={activeProtocol?.primaryColor} />
        )}
      </RowBetween>
      {open && activeProtocol && <Flyout options={options.length}>{options}</Flyout>}
    </Wrapper>
  )
}
