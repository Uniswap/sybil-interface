import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
import styled from 'styled-components'
import GoogleAnalyticsReporter from '../components/analytics/GoogleAnalyticsReporter'
import Polling from '../components/Header/Polling'
import Popups from '../components/Popups'
import Web3ReactManager from '../components/Web3ReactManager'
import DarkModeQueryParamReader from '../theme/DarkModeQueryParamReader'
import Profile from '../components/Profile'
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
import OverviewColumn from '../components/governance/OverviewColumn'

const SiteWrapper = styled.div`
  height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 320px 1fr 376px;
  overflow: auto;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr 376px;
  `};

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
  padding: 2rem;
  align-items: center;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;

  @media (max-width: 1080px) {
    padding-top: 1rem;
    padding-bottom: 120px;
  }
`

function TopLevelModals() {
  const open = useModalOpen(ApplicationModal.DELEGATE)
  const toggle = useToggleModal(ApplicationModal.DELEGATE)
  return <DelegateModal isOpen={open} onDismiss={toggle} title="Delegate" />
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <SiteWrapper>
        <ContentWrapper>
          <Web3Status />
          <Popups />
          <Polling />
          <Web3ReactManager>
            <Switch>
              <Route exact strict path="/delegates/:protocolID" component={Delegates} />
              <Route path="/" component={RedirectWithUpdatedGovernance} />
            </Switch>
          </Web3ReactManager>
        </ContentWrapper>
        <Profile />
      </SiteWrapper>
    </Suspense>
  )
}
