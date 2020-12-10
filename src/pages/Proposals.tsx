import React from 'react'
import { BodyWrapper } from './AppBody'
import { useAllProposals } from '../state/governance/hooks'
import ProposalList from '../components/governance/ProposalList'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { OutlineCard } from '../components/Card'
import { ChainId } from '@uniswap/sdk'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import { AutoColumn } from '../components/Column'
import Tabs from '../components/governance/Tabs'

export default function Proposals({
  match: {
    params: { protocolID }
  }
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  const topProposals = useAllProposals()

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  return (
    <BodyWrapper>
      <AutoColumn gap="1rem">
        <Tabs />
        {chainId === ChainId.MAINNET ? (
          <ProposalList allProposals={topProposals} />
        ) : (
          <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
        )}
      </AutoColumn>
    </BodyWrapper>
  )
}
