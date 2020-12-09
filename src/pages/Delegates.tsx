import React from 'react'
import { BodyWrapper } from './AppBody'
import { useTopDelegates, useFilterActive } from '../state/governance/hooks'
import DelegateList from '../components/governance/DelegateList'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId } from '@uniswap/sdk'
import { OutlineCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'

export default function Delegates({
  match: {
    params: { protocolID }
  }
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  // get top delegates
  const [filter] = useFilterActive()
  const topDelegates = useTopDelegates(filter)

  return (
    <BodyWrapper>
      {chainId === ChainId.MAINNET ? (
        <DelegateList topDelegates={topDelegates} />
      ) : (
        <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
      )}
    </BodyWrapper>
  )
}
