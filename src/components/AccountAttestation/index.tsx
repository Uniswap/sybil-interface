import React, { useState } from 'react'

import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { ButtonPrimary } from '../Button'
import { TYPE, SolidSectionBreak, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { BlurredCard } from '../Card'
import { shortenAddress, getEtherscanLink } from '../../utils'
import AccountView from './AccountView'
import { useWalletModalToggle } from '../../state/application/hooks'
import TwitterFlow from './TwitterFlow'
import useENS from '../../hooks/useENS'
import { useTwitterDataForAccount } from '../../state/attestations/hooks'

export default function AccountAttestation() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // if not attested, show twitter flow
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  const { name } = useENS(account)

  const profileData = useTwitterDataForAccount(account)

  return (
    <BlurredCard>
      {showTwitterFlow && <TwitterFlow endFlow={() => setShowTwitterFlow(false)} />}
      <AutoColumn gap="lg">
      {!profileData?.handle && account && (
          <ButtonPrimary onClick={() => setShowTwitterFlow(true)}>Announce yourself as a Uniswap delegate</ButtonPrimary>
        )}
        {!account && <ButtonPrimary onClick={toggleWalletModal}>Connect a wallet</ButtonPrimary>}
       
        {account ? (
          <AutoColumn gap="sm">
            <RowBetween>
              <TYPE.mediumHeader>{shortenAddress(account)}</TYPE.mediumHeader>
              {account && chainId && (
                <ExternalLink href={getEtherscanLink(chainId, account, 'address')}>↗</ExternalLink>
              )}
            </RowBetween>
            {name && name}
          </AutoColumn>
        ) : (
          <TYPE.mediumHeader> {'Add an attestation'}</TYPE.mediumHeader>
        )}
        <SolidSectionBreak />
        <AccountView name={profileData?.name} handle={profileData?.handle} imageURL={profileData?.profileURL} />
      </AutoColumn>
    </BlurredCard>
  )
}
