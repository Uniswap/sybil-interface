import React, { useState } from 'react'

import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { ButtonPrimary } from '../Button'
import { TYPE, SolidSectionBreak, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { OutlineCard } from '../Card'
import { shortenAddress, getEtherscanLink } from '../../utils'
import AccountView from './AccountView'
import { useWalletModalToggle } from '../../state/application/hooks'
import TwitterFlow from './TwitterFlow'
import useENS from '../../hooks/useENS'
import Modal from '../Modal'
import { useTwitterProfileData, useVerifiedHandle } from '../../state/social/hooks'

export default function AccountAttestation() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // if not attested, show twitter flow
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  const { name: ensName } = useENS(account)

  // check kv list for handle, then fetch profile info from twitter
  const verifiedHandle = useVerifiedHandle(account)
  const profileData = useTwitterProfileData(verifiedHandle)

  return (
    <OutlineCard>
      <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
        <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} />
      </Modal>
      <AutoColumn gap="lg">
        {account ? (
          <AutoColumn gap="sm">
            <RowBetween>
              <TYPE.mediumHeader>{shortenAddress(account)}</TYPE.mediumHeader>
              {account && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>↗</ExternalLink>
              )}
            </RowBetween>
            {ensName ?? ''}
          </AutoColumn>
        ) : (
          <TYPE.mediumHeader> {'Add an attestation'}</TYPE.mediumHeader>
        )}
        {!profileData?.handle && account && (
          <ButtonPrimary onClick={() => setShowTwitterFlow(true)}>Link this address</ButtonPrimary>
        )}
        {!account && <ButtonPrimary onClick={toggleWalletModal}>Connect a wallet</ButtonPrimary>}
        <SolidSectionBreak />
        <AccountView name={profileData?.name} handle={profileData?.handle} imageURL={profileData?.profileURL} />
      </AutoColumn>
    </OutlineCard>
  )
}
