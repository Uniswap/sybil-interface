import React from 'react'
import { BodyWrapper, MediumHeaderWrapper } from './AppBody'
import { useAllProposals, useActiveProtocol } from '../state/governance/hooks'
import ProposalList from '../components/governance/ProposalList'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { OutlineCard } from '../components/Card'
import { ChainId } from '@uniswap/sdk'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import { AutoColumn } from '../components/Column'
import { RowFixed } from '../components/Row'
import { TYPE, Above1080Only, Below1080Only } from '../theme'
import { WrappedListLogo } from '../components/governance/styled'
import Tabs from '../components/governance/Tabs'
import Dropdown from '../components/governance/Dropdown'

export default function Proposals({
  match: {
    params: { protocolID },
  },
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  const topProposals = useAllProposals()

  const [activeProtocol] = useActiveProtocol()

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  return (
    <BodyWrapper>
      <AutoColumn gap="1rem">
        <MediumHeaderWrapper>
          <AutoColumn gap="sm">
            <Above1080Only>
              <RowFixed>
                <WrappedListLogo src={activeProtocol?.logo} />
                <TYPE.mediumHeader ml="8px" fontWeight={600} color={activeProtocol?.primaryColor}>
                  {activeProtocol?.name}
                </TYPE.mediumHeader>
              </RowFixed>
            </Above1080Only>
            <Below1080Only>
              <Dropdown />
            </Below1080Only>
            <Tabs />
          </AutoColumn>
        </MediumHeaderWrapper>
        {chainId === ChainId.MAINNET ? (
          <ProposalList allProposals={topProposals} />
        ) : (
          <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
        )}
      </AutoColumn>
    </BodyWrapper>
  )
}
