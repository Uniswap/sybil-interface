import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Polling from '../components/Header/Polling'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Overview from './Governance'
import { RedirectWithUpdatedGovernance } from './Governance/redirect'
import SideMenu from '../components/Menu/SideMenu'
import TwitterAccountQueryParamReader from '../state/social/TwitterAccountQueryParamReader'
import Web3Status from '../components/Web3Status'
import Delegates from './Delegates'
import Proposals from './Proposals'
import ProposalDetails from '../components/governance/ProposalDetails'
import DelegateInfo from './DelegateInfo'
import DelegateModal from '../components/vote/DelegateModal'
import { useModalOpen, useToggleModal } from '../state/application/hooks'
import { ApplicationModal } from '../state/application/actions'

const SiteWrapper = styled.div`
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 1.5em;
  overflow: auto;

  @media (max-width: 1080px) {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    overflow-x: hidden;
    grid-gap: 0;
  }
`

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding-top: 64px;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 2rem 0 0 0;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem 0 0 0;
  `};
`

const Marginer = styled.div`
  margin-top: 5rem;
`

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.DELEGATE)
  const toggle = useToggleModal(ApplicationModal.DELEGATE)
  return <DelegateModal isOpen={open} onDismiss={toggle} title="Delegate" />
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <Route component={GoogleAnalyticsReporter} />
      <Route component={DarkModeQueryParamReader} />
      <Route component={TwitterAccountQueryParamReader} />
      <SiteWrapper>
        <SideMenu />
        <ContentWrapper>
          <Web3Status />
          <Popups />
          <Polling />
          <Overview />
          <TopLevelModals />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/delegates/:protocolID" component={Delegates} />
              <Route exact strict path="/proposals/:protocolID" component={Proposals} />
              <Route exact strict path="/proposals/:protocolID/:proposalID" component={ProposalDetails} />
              <Route exact strict path="/delegates/:protocolID/:delegateAddress" component={DelegateInfo} />
              <Route path="/" component={RedirectWithUpdatedGovernance} />
            </Switch>
          </Web3ReactManager>
          <Marginer />
        </ContentWrapper>
      </SiteWrapper>
    </Suspense>
  )
}
