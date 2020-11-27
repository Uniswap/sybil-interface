import React, { useEffect } from 'react'
import { BodyWrapper } from './AppBody'
import { useAllProposals, useActiveProtocol } from '../state/governance/hooks'
import ProposalList from '../components/governance/ProposalList'
import { RouteComponentProps } from 'react-router-dom'
import { AppDispatch } from '../state'
import { useDispatch } from 'react-redux'
import { SUPPORTED_PROTOCOLS } from '../state/governance/reducer'

export default function Proposals({
  match: {
    params: { protocolID }
  }
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  const dispatch = useDispatch<AppDispatch>()
  const [, setActiveProtocol] = useActiveProtocol()
  useEffect(() => {
    if (protocolID && Object.keys(SUPPORTED_PROTOCOLS).includes(protocolID)) {
      setActiveProtocol(SUPPORTED_PROTOCOLS[protocolID])
    }
  }, [dispatch, protocolID, setActiveProtocol])

  const topProposals = useAllProposals()

  return (
    <BodyWrapper>
      <ProposalList allProposals={topProposals} />
    </BodyWrapper>
  )
}
