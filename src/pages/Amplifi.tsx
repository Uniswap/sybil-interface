import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import { BodyWrapper, MediumHeaderWrapper } from './AppBody'
import { useActiveWeb3React } from '../hooks'
import { useActiveProtocol } from '../state/governance/hooks'
import { AutoColumn } from '../components/Column'
import { Above1080Only, Below1080Only } from '../theme/components'
import { RowFixed } from '../components/Row'
import { WrappedListLogo } from '../components/governance/styled'
import Dropdown from '../components/governance/Dropdown'
import Tabs from '../components/governance/Tabs'
import { TYPE } from '../theme'


export default function Amplifi({
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
            </AutoColumn>
        </BodyWrapper>
    )
}