import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { TYPE, ExternalLink, BlankInternalLink } from '../../theme'
import { AutoColumn } from '../Column'
import { ButtonBasic } from '../Button'
import { GitHub, HelpCircle, ChevronLeft, X } from 'react-feather'
import '../../theme/extraFonts.css'
import MenuBG from '../../assets/images/menu-bg.png'
import Logo from '../../assets/svg/sybil-logo.svg'
import { Break } from '../../pages/DelegateInfo'
import { useActiveProtocol } from '../../state/governance/hooks'
import { SUPPORTED_PROTOCOLS } from '../../state/governance/reducer'

const Wrapper = styled.div<{ open: boolean }>`
  height: 100vh;
  position: absolute;
  z-index: 2;
  width: ${({ open }) => (open ? '350px' : '82px')};
  background-color: #fff;
  padding: 1rem 0rem;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: space-between;
  border-right: 1px solid #fdeef5;
  transition: width 0.1s linear;
  box-shadow: ${({ open }) => (open ? '0px 6px 10px 10px rgba(0, 0, 0, 0.05);' : 'none')};
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

const SybilLogo = styled.div`
  width: 36px;
  height: 36px;
  background-image: url(${Logo});
  background-size: cover;
  outline: none;
  border-radius: 50%;
`

const SybilWorkmark = styled.div`
  font-weight: 600;
  font-size: 20px;
  font-style: italic;
`

export const WrappedListLogo = styled.img<{ color: string }>`
  height: 40px;
  width: 40px;
  border-radius: 50%;

  :hover {
    cursor: pointer;
    border: ${({ color }) => '1px solid ' + color};
  }
`

export const HoverRow = styled(RowFixed)`
  :hover {
    cursor: pointer;
    opacity: 0.7;
  }
`

export default function SideMenu(): JSX.Element {
  const [open, setOpen] = useState(false)
  const [faqOpen, setfaqOpen] = useState(false)
  const [activeProtocol] = useActiveProtocol()

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
        <AutoColumn gap="24px">
          <div style={{ padding: '0 1.25rem', height: '28px' }}>
            {!open ? (
              <SybilLogo />
            ) : (
              <RowBetween align="flex-start">
                <RowFixed style={{ gap: '8px' }}>
                  <SybilLogo />
                  <SybilWorkmark>sybil</SybilWorkmark>
                </RowFixed>
                <ButtonBasic
                  onClick={() => closeBoth()}
                  style={{ cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.4)', color: '#000' }}
                >
                  <ChevronLeft />
                </ButtonBasic>
              </RowBetween>
            )}
          </div>
          <div style={{ padding: '0 1.25rem' }}>
            <Break />
          </div>
          {Object.values(SUPPORTED_PROTOCOLS).map((p) => (
            <BlankInternalLink key={p.id + '-image-id'} to={'/delegates/' + p.id}>
              <HoverRow
                onClick={(e) => {
                  e.stopPropagation()
                  setOpen(false)
                }}
              >
                <div
                  style={{
                    height: '30px',
                    backgroundColor: activeProtocol?.id === p.id ? activeProtocol?.primaryColor : 'transparent',
                    width: '2px',
                  }}
                />

                <div style={{ padding: '0 1.25rem', marginLeft: '-2px' }}>
                  <RowFixed>
                    <WrappedListLogo src={p.logo} color={p.primaryColor} />
                    {open && (
                      <TYPE.mediumHeader fontSize="16px" ml={'12px'} color={p.primaryColor}>
                        {p.name}
                      </TYPE.mediumHeader>
                    )}
                  </RowFixed>
                </div>
              </HoverRow>
            </BlankInternalLink>
          ))}
        </AutoColumn>

        {!faqOpen ? (
          <AutoColumn gap="16px" style={{ justifySelf: 'flex-end', alignItems: 'flex-start', padding: '0 1.25rem' }}>
            <ButtonBasic
              as={ExternalLink}
              href="https://github.com/Uniswap/sybil-list"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', gap: 12, padding: 0 }}
            >
              <GitHub size={20} />
            </ButtonBasic>
            <ButtonBasic
              onClick={() => setfaqOpen(!faqOpen)}
              href="https://github.com/Uniswap/sybil-list"
              style={{ backgroundColor: 'rgba(255,255,255,0.4)', color: '#000', padding: 0 }}
            >
              <HelpCircle size={20} />
            </ButtonBasic>
            {open && (
              <AutoColumn gap="1rem" style={{ justifySelf: 'flex-start' }}>
                <TYPE.black style={{ lineHeight: '125%', fontWeight: 400, fontSize: '12px', padding: 0 }}>
                  A{' '}
                  <ExternalLink style={{ color: '#ff007a' }} href="https://uniswap.org/">
                    Uniswap
                  </ExternalLink>{' '}
                  Project
                </TYPE.black>
              </AutoColumn>
            )}
          </AutoColumn>
        ) : (
          <RowBetween style={{ padding: '0 1rem' }}>
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
          <AutoColumn gap="1.5rem" style={{ padding: '0 1.25rem' }}>
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
