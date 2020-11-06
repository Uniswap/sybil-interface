import React from 'react'

import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { ButtonPrimary } from '../Button'
import { TYPE, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { GreyCard } from '../Card'
import { shortenAddress, getEtherscanLink } from '../../utils'
import TwitterAccountSection from './TwitterAccountSection'
import { useWalletModalToggle } from '../../state/application/hooks'
import useENS from '../../hooks/useENS'

export default function GovernanceAccountSection() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // if not attested, show twitter flow
  const { name: ensName } = useENS(account)

  return (
    <GreyCard>
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
        {!account && <ButtonPrimary onClick={toggleWalletModal}>Connect a wallet</ButtonPrimary>}
        <TwitterAccountSection />
      </AutoColumn>
    </GreyCard>
  )
}
