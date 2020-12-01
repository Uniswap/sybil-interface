import React, { useEffect } from 'react'
import { BodyWrapper } from './AppBody'
import { useTopDelegates, useActiveProtocol } from '../state/governance/hooks'
import DelegateList from '../components/governance/DelegateList'
import { RouteComponentProps } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../state'
import { SUPPORTED_PROTOCOLS } from '../state/governance/reducer'
import { useActiveWeb3React } from '../hooks'
import { ChainId } from '@uniswap/sdk'
import { OutlineCard } from '../components/Card'

export default function Delegates({
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

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  const topDelegates = useTopDelegates()
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
