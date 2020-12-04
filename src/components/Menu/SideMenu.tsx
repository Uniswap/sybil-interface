import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, ExternalLink } from '../../theme'
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
  justify-content: flex-start;

  background: url(${MenuBG});

  overflow: auto;

  :hover {
    cursor: ${({ open }) => (open ? 'unset' : 'pointer')};
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`

    display: none;
  `};
`

const MobileHeader = styled.div`
  width: 100%;
  background-color: red;
  display: none;
  padding: 1rem;
  background: url(${MenuBG});

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: initial;
  `};
`

const FlippedText = styled.div`
  -webkit-transform: rotate(90deg);
`

export default function SideMenu() {
  const [open, setOpen] = useState(true)

  return (
    <>
      <MobileHeader>
        <RowBetween>
          <TYPE.mediumHeader>Sybil</TYPE.mediumHeader>
          <ExternalLink href="https://github.com/Uniswap/sybil-list">
            <Book style={{ stroke: 'black' }} />
          </ExternalLink>
        </RowBetween>
      </MobileHeader>
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
            <TYPE.main>Sybil is a tool that connects Ethereum addresses to digital indentities.</TYPE.main>
            <TYPE.main>
              This interface uses Sybil to help discovery for delegates and voters within governance systems on
              Ethereum. Connect a web3-wallet and announce on Twitter to verify your social identity.
            </TYPE.main>
            <TYPE.body fontWeight={600}>I don’t have Twitter, can I use Sybil?</TYPE.body>
            <TYPE.main>
              At the moment Sybil is Twitter only, but the architecture allows arbitrary services to act as an
              authentication methods. For instance, github integration is coming soon.
            </TYPE.main>
            <TYPE.body fontWeight={600}>Is Sybil only for governance?</TYPE.body>
            <TYPE.main>
              No! Sybil can be used to connect identities to addresses for any type of project that uses addresses. In
              fact, you don’t even have to use sybil through this interface! Check out the documentation for how to set
              up a similar system.
            </TYPE.main>
            <TYPE.body fontWeight={600}>Why build Sybil?</TYPE.body>
            <TYPE.main>
              Sybil tries to answer the question: What is the most simple way to connect an identity to an address
              without requiring user signups or on chain fees. There are many great identity products out there, but
              many are too complex for the simple needs of delegates and voters within governance systems.
            </TYPE.main>
          </AutoColumn>
        )}
        {open ? (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end' }}>
            <ButtonBasic
              as={ExternalLink}
              href="https://github.com/Uniswap/sybil-list"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
            >
              <Book />
              Sybil Documentation
            </ButtonBasic>
          </AutoColumn>
        ) : (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end', marginTop: '1rem' }}>
            <Code />
            <Book />
            <HelpCircle />
          </AutoColumn>
        )}
      </Wrapper>
    </>
  )
}
