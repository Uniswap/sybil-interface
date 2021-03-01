import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE, ExternalLink, BlankInternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { ButtonBasic } from '../Button'
import { GitHub, Code, HelpCircle, ChevronLeft, X } from 'react-feather'
import '../../theme/extraFonts.css'
import MenuBG from '../../assets/images/menu-bg.png'
import Logo from '../../assets/images/sybil_logo.png'

const Wrapper = styled.div<{ open: boolean }>`
  height: 100vh;
  position: relative;
  width: ${({ open }) => (open ? '350px' : '60px')};
  background-color: #f7f8fa;
  padding: ${({ open }) => (open ? '2rem 2rem' : '1rem 1.25rem')};
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;
  align-items: ${({ open }) => (open ? 'unset' : 'center')};
  background: url(${MenuBG});
  background-size: cover;
  border-right: 1px solid #efefef;
  transition: width 0.1s linear;

  overflow: auto;

  :hover {
    cursor: ${({ open }) => (open ? 'unset' : 'pointer')};
  }

  @media (max-width: 1080px) {
    display: none;
  }
`

const MobileHeader = styled.div`
  width: 100%;
  background-color: red;
  display: none;
  padding: 1rem;
  background: url(${MenuBG});

  @media (max-width: 1080px) {
    display: initial;
  }
`

const FlippedText = styled.div`
  -webkit-transform: rotate(90deg);
`

const SybilLogo = styled.div`
  width: 32px;
  height: 32px;
  mix-blend-mode: multiply;
  background-image: url(${Logo});
  background-size: contain;
  outline: none;
`

const SybilWorkmark = styled.div`
  font-weight: 600;
  font-size: 20px;
  font-style: italic;
`

const Haptik = styled(TYPE.black)`
  fontfamily: 'GT Haptik Medium';
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
          <BlankInternalLink to="/">
            <RowFixed style={{ gap: '8px' }}>
              <SybilLogo />
              <SybilWorkmark>sybil</SybilWorkmark>
            </RowFixed>
          </BlankInternalLink>
          <ExternalLink href="https://github.com/Uniswap/sybil-list">
            <GitHub size={20} style={{ stroke: 'black' }} />
          </ExternalLink>
        </RowBetween>
      </MobileHeader>
      <Wrapper open={open} onClick={() => !open && setOpen(!open)}>
        {!open && (
          <span style={{ width: '30px' }}>
            <SybilLogo style={{ marginBottom: '8px' }} />
            <FlippedText>
              <SybilWorkmark>sybil</SybilWorkmark>
            </FlippedText>
          </span>
        )}
        {open && !faqOpen && (
          <RowBetween>
            <BlankInternalLink style={{ color: '#08052C' }} to="/">
              <RowFixed style={{ gap: '8px' }}>
                <SybilLogo />
                <SybilWorkmark>sybil</SybilWorkmark>
              </RowFixed>
            </BlankInternalLink>
            <ButtonBasic
              onClick={() => closeBoth()}
              style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', color: '#000' }}
            >
              <ChevronLeft />
            </ButtonBasic>
          </RowBetween>
        )}
        {open && !faqOpen && (
          <AutoColumn gap="3rem">
            <AutoColumn gap="1rem">
              <Haptik fontSize="36px" style={{ marginBottom: '1rem', fontSize: '36px', lineHeight: '115%' }}>
                An Ethereum Governance Tool.
              </Haptik>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>
                Sybil is a governance tool for discovering delegates. Sybil maps on-chain addresses to digital
                identities to maintain a list of delegates.
              </TYPE.black>
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>
                Sybil can support many governance systems. Feel free to
                <ExternalLink href="https://github.com/Uniswap/sybil-interface/issues/new?assignees=&labels=&template=new-protocol.md&title=">
                  {' '}
                  add others
                </ExternalLink>
                .
              </TYPE.black>
            </AutoColumn>
            <AutoColumn gap="1rem">
              <ButtonBasic
                as={ExternalLink}
                href="https://github.com/Uniswap/sybil-list"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
              >
                <GitHub size={20} />
                <TYPE.black style={{ lineHeight: '125%', fontWeight: 500 }}> Documentation</TYPE.black>
              </ButtonBasic>
              <ButtonBasic
                onClick={() => setfaqOpen(!faqOpen)}
                href="https://github.com/Uniswap/sybil-list"
                style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
              >
                <HelpCircle size={20} />
                <TYPE.black style={{ lineHeight: '125%', fontWeight: 500 }}>
                  Help and Info {faqOpen && '(close)'}
                </TYPE.black>
              </ButtonBasic>
            </AutoColumn>
          </AutoColumn>
        )}
        {open && !faqOpen ? (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end' }}>
            <TYPE.black style={{ lineHeight: '125%', fontWeight: 400, fontSize: '12px' }}>
              A{' '}
              <ExternalLink style={{ color: '#ff007a' }} href="https://uniswap.org/">
                Uniswap
              </ExternalLink>{' '}
              Project
            </TYPE.black>
          </AutoColumn>
        ) : !faqOpen ? (
          <AutoColumn gap="1rem" style={{ justifySelf: 'flex-end', marginTop: '1rem' }}>
            <Code size={20} />
            <GitHub size={20} />
            <HelpCircle size={20} />
          </AutoColumn>
        ) : (
          <RowBetween>
            <ButtonBasic
              onClick={() => setfaqOpen(!faqOpen)}
              href="https://GitHub.com/Uniswap/sybil-list"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12 }}
            >
              <HelpCircle size={20} />
              <TYPE.black style={{ lineHeight: '125%', fontWeight: 400 }}>Help and Info</TYPE.black>
            </ButtonBasic>
            <ButtonBasic
              onClick={() => setfaqOpen(!faqOpen)}
              style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', color: '#000' }}
            >
              <X />
            </ButtonBasic>
          </RowBetween>
        )}

        {faqOpen && (
          <AutoColumn gap="1.5rem">
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>Why build Sybil?</TYPE.body>
              <TYPE.main>
                We wanted to support various Ethereum governance initiatives and found it hard to find potential
                delegates or no easy way to delegate our vote. Sybil is our contribution to help everyone in the
                ecosystem.
              </TYPE.main>
            </AutoColumn>
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>I don’t have Twitter, can I use Sybil?</TYPE.body>
              <TYPE.main>
                At the moment Sybil is Twitter only, but the architecture allows arbitrary services to act as
                authentication methods. We are planning to add GitHub soon and feel free to suggest others in our&nbsp;
                <ExternalLink href="https://github.com/Uniswap/sybil-interface#adding-protocol-support">
                  repo
                </ExternalLink>
                .
              </TYPE.main>
            </AutoColumn>
            <AutoColumn gap="0.5rem">
              <TYPE.body fontWeight={600}>Is Sybil only for governance?</TYPE.body>
              <TYPE.main>
                Since the mapping of wallets to identities is public, you can easily use it to show identities anywhere.
                In fact, you don’t even have to use Sybil through this interface! Check out the documentation for how to
                set up a similar system.
              </TYPE.main>
            </AutoColumn>
          </AutoColumn>
        )}
      </Wrapper>
    </>
  )
}
