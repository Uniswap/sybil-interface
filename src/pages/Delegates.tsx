import React from 'react'
import { BodyWrapper, MediumHeaderWrapper } from './AppBody'
import DelegateList from '../components/governance/DelegateList'
import { RouteComponentProps } from 'react-router-dom'
import { useActiveWeb3React } from '../hooks'
import { ChainId } from '@uniswap/sdk'
import { OutlineCard } from '../components/Card'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import { AutoColumn } from '../components/Column'
import Dropdown from '../components/governance/Dropdown'
import { TYPE } from '../theme'
import { useActiveProtocol } from '../state/governance/hooks'
import { RowFixed } from '../components/Row'
import { WrappedListLogo } from '../components/governance/styled'
import Tabs from '../components/governance/Tabs'
import RelayMessageIcon from '../assets/images/newRelayMessage.svg'

import { Above1080Only, Below1080Only } from '../theme/components'
import { ReceiverLaunch } from '@relaycc/receiver'

export default function Delegates({
  match: {
    params: { protocolID },
  },
}: RouteComponentProps<{ protocolID?: string }>) {
  // if valid protocol id passed in, update global active protocol
  useProtocolUpdate(protocolID)

  // if on testnet, show warning
  const { chainId } = useActiveWeb3React()

  const [activeProtocol] = useActiveProtocol()

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
          <DelegateList hideZero={false} />
        ) : (
          <OutlineCard>Please switch to Ethereum mainnet. </OutlineCard>
        )}
      </AutoColumn>
      <ReceiverLaunch
        inlineLaunch
        launchText=""
        launchButtonStyle={{
          backgroundSize: 50,
          backgroundImage: 'url(' + RelayMessageIcon + ')',
          position: 'fixed',
          bottom: 50,
          right: 20,
          height: 50,
          width: 50,
        }}
        peerAddress="0x0cb27e883e207905ad2a94f9b6ef0c7a99223c37"
      />
    </BodyWrapper>
  )
}
