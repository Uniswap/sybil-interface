import React from 'react'
import { BodyWrapper } from './AppBody'
import ProfileGeneric from '../components/ProfileGeneric'
import { CONNECT_CONFIG } from '../state/governance/reducer'
import { useProtocolUpdate } from '../hooks/useProtocolUpdate'
import Dropdown from '../components/governance/Dropdown'
import { Below1080Only } from '../theme/components'

export default function Identities() {
  useProtocolUpdate(CONNECT_CONFIG.id)

  return (
    <BodyWrapper>
      <Below1080Only>
        <Dropdown />
      </Below1080Only>
      <ProfileGeneric />
    </BodyWrapper>
  )
}
