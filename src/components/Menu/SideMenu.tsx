import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon, ExternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { ButtonBasic } from '../Button'
import { Book, Code, HelpCircle, ChevronLeft } from 'react-feather'

import MenuBG from '../../assets/images/menu-bg.png'

const Wrapper = styled.div<{ open: boolean }>`
  height: 100vh;
  width: ${({ open }) => (open ? '350px' : '60px')};
  background-color: #f7f8fa;
  padding: ${({ open }) => (open ? '2rem 2rem' : '2rem 1.25rem')};
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;

  background: url(${MenuBG});

  :hover {
    cursor: ${({ open }) => (open ? 'unset' : 'pointer')};
  }
`

const FlippedText = styled.div`
  -webkit-transform: rotate(90deg);
`

export default function SideMenu() {
  const [open, setOpen] = useState(true)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <Wrapper open={open} onClick={() => !open && setOpen(!open)}>
      {!open && (
        <FlippedText>
          <TYPE.mediumHeader>Sybil</TYPE.mediumHeader>
        </FlippedText>
      )}
      {open && (
        <RowBetween>
          <TYPE.mediumHeader>Sybil</TYPE.mediumHeader>
          <ButtonBasic
            onClick={() => setOpen(!open)}
            style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', color: '#000' }}
          >
            <ChevronLeft />
          </ButtonBasic>
        </RowBetween>
      )}
      {open && (
        <AutoColumn gap="1rem">
          <TYPE.largeHeader>Social proof for Ethereum Products</TYPE.largeHeader>
          <TYPE.main>
            This tool connects a wallet address to a digital identity by signing a message on chain.
          </TYPE.main>
          <TYPE.main>
            This mapping can be used for displaying public identies for governance platforms on ethereum or any project
            that wants to connect social idenity to addresses.
          </TYPE.main>
          <TYPE.main>Open, public, forkable and on chain.</TYPE.main>
        </AutoColumn>
      )}
      {open ? (
        <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end' }}>
          <ButtonBasic style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}>
            <Code />
            Make a sybil list
          </ButtonBasic>
          <ButtonBasic style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}>
            <Book />
            Sybil Documentation
          </ButtonBasic>
          <ButtonBasic style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}>
            <HelpCircle />
            Learn about how it works
          </ButtonBasic>
        </AutoColumn>
      ) : (
        <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end' }}>
          <Code />
          <Book />
          <HelpCircle />
        </AutoColumn>
      )}
    </Wrapper>
  )
}
