import React from 'react'
import { BodyWrapper } from './AppBody'
import DelegateList from '../components/governance/DelegateList'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId } from '@uniswap/sdk'
import { OutlineCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import Tabs from '../components/governance/Tabs'
import { AutoColumn } from '../components/Column'

export default function Delegates({
  match: {
    params: { protocolID }
  }
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  // // filter out zero votes, value from tabs
  // const [hideZero, setHideZero] = useState<boolean>(true)

  return (
    <BodyWrapper>
      <AutoColumn gap="1rem">
        <Tabs />
        {chainId === ChainId.MAINNET ? (
          <DelegateList hideZero={false} />
        ) : (
          <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
        )}
      </AutoColumn>
    </BodyWrapper>
  )
}
