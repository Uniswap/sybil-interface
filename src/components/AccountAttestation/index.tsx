import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { ButtonPrimary } from '../Button'
import { TYPE, SolidSectionBreak } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { OutlineCard } from '../Card'
import { shortenAddress } from '../../utils'
import EmptyAccount from './EmptyAccount'
import { useWalletModalToggle } from '../../state/application/hooks'
import TwitterFlow from './TwitterFlow'

export default function AccountAttestation() {
  const { account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // verified attestation for addres <-> handle
  const [linkedHandle] = useState()

  // if not attested, show twitter flow
  const [showTwitterFlow, setShowTwitterFlow] = useState(true)

  return (
    <OutlineCard>
      {showTwitterFlow && account ? (
        <TwitterFlow endFlow={() => setShowTwitterFlow(false)} />
      ) : (
        <AutoColumn gap="lg">
          <TYPE.mediumHeader>{account ? shortenAddress(account) : 'Add an attestation'}</TYPE.mediumHeader>
          {!linkedHandle && account && (
            <ButtonPrimary onClick={() => setShowTwitterFlow(true)}>Link this address</ButtonPrimary>
          )}
          {!account && <ButtonPrimary onClick={toggleWalletModal}>Connect a wallet</ButtonPrimary>}
          <SolidSectionBreak />
          <EmptyAccount />
        </AutoColumn>
      )}
    </OutlineCard>
  )
}
