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
  position: relative;
  width: ${({ open }) => (open ? '350px' : '60px')};
  background-color: #f7f8fa;
  padding: ${({ open }) => (open ? '2rem 2rem' : '2rem 1.25rem')};
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;

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
  const [faqOpen, setfaqOpen] = useState(false)

  function closeBoth() {
    setOpen(!open)
    setfaqOpen(false)
  }

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
        {open && !faqOpen && (
          <RowBetween>
            <TYPE.mediumHeader>Sybil</TYPE.mediumHeader>
            <ButtonBasic
              onClick={() => closeBoth()}
              style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', color: '#000' }}
            >
              <ChevronLeft />
            </ButtonBasic>
          </RowBetween>
        )}
        {open && !faqOpen && (
          <AutoColumn gap="1.5rem">
            <AutoColumn gap="1rem">
              <TYPE.black
                style={{ marginBottom: '1rem', fontFamily: 'GT Haptik Medium', fontSize: '36px', lineHeight: '125%' }}
              >
                An Ethereum Governance Tool.
              </TYPE.black>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>
                Discover delegates or announce yourself as a delegate.
              </TYPE.black>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>
                Sybil maintains a list of known delegates and their digital identities. It uses publicly posted signed
                messages to map wallets to identities and makes this list available for anyone to use.
              </TYPE.black>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>Open, public, and forkable.</TYPE.black>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>
                A <ExternalLink href="uniswap.org">Uniswap</ExternalLink> Project
              </TYPE.black>
            </AutoColumn>
          </AutoColumn>
        )}
        {open ? (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end' }}>
            {!faqOpen && (
              <ButtonBasic
                as={ExternalLink}
                href="https://github.com/Uniswap/sybil-list"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
              >
                <Book />
                Sybil Documentation
              </ButtonBasic>
            )}
            <ButtonBasic
              onClick={() => setfaqOpen(!faqOpen)}
              href="https://github.com/Uniswap/sybil-list"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
            >
              <HelpCircle />
              Help and Info {faqOpen && '(close)'}
            </ButtonBasic>
          </AutoColumn>
        ) : (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end', marginTop: '1rem' }}>
            <Code />
            <Book />
            <HelpCircle />
          </AutoColumn>
        )}

        {faqOpen && (
          <AutoColumn gap="1.5rem">
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>Why build Sybil?</TYPE.body>
              <TYPE.main>
                Sybil tries to answer the question: What is the most simple way to connect an identity to an address
                without requiring user signups or on chain fees. There are many great identity products out there, but
                many are too complex for the simple needs of delegates and voters within governance systems.
              </TYPE.main>
            </AutoColumn>
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>I don’t have Twitter, can I use Sybil?</TYPE.body>
              <TYPE.main>
                At the moment Sybil is Twitter only, but the architecture allows arbitrary services to act as
                authentication methods. For instance, Github integration is coming soon.
              </TYPE.main>
            </AutoColumn>
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>Is Sybil only for governance?</TYPE.body>
              <TYPE.main>
                Sybil can be used to connect identities to addresses for any type of project that uses addresses. In
                fact, you don’t even have to use sybil through this interface! Check out the documentation for how to
                set up a similar system.
              </TYPE.main>
            </AutoColumn>
          </AutoColumn>
        )}
      </Wrapper>
    </>
  )
}
