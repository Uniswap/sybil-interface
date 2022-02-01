import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import { BodyWrapper } from './AppBody'


export default function Amplifi({
    match: {
        params: { protocolID },
    },
}: RouteComponentProps<{ protocolID?: string }>) {
    // if valid protocol id passed in, update global active protocol
    useProtocolUpdate(protocolID)

    return (
        <BodyWrapper>
        </BodyWrapper>
    )
}