import React from 'react'
import { BodyWrapper } from './AppBody'
import ProfileGeneric from '../components/ProfileGeneric'
import { CONNECT_CONFIG } from '../state/governance/reducer'
import { useDispatch } from 'react-redux'
import { updateLastSelectedProtocolID } from '../state/user/actions'

import { AppDispatch } from 'state'

export default function Identities() {
  const dispatch = useDispatch<AppDispatch>()
  // reuse the protocol id 'connect' for twitter callback redirects purpose
  dispatch(updateLastSelectedProtocolID({ protocolID: CONNECT_CONFIG.id }))

  return (
    <BodyWrapper>
      <ProfileGeneric />
    </BodyWrapper>
  )
}
