import React, { useState } from 'react'
import styled from 'styled-components'

import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import { ButtonPrimary } from '../Button'
import { TYPE, SolidSectionBreak, ExternalLink } from '../../theme'
import { useActiveWeb3React } from '../../hooks'
import { OutlineCard } from '../Card'
import { shortenAddress, getEtherscanLink } from '../../utils'
import EmptyAccount from './EmptyAccount'
import { useWalletModalToggle } from '../../state/application/hooks'
import TwitterFlow from './TwitterFlow'
import useENS from '../../hooks/useENS'
import Modal from '../Modal'

const StepsWrapper = styled.div`
  padding: 2rem;
  width: 100%;
`

export default function AccountAttestation() {
  const { chainId, account } = useActiveWeb3React()

  const toggleWalletModal = useWalletModalToggle()

  // verified attestation for addres <-> handle
  const [linkedHandle] = useState()

  // if not attested, show twitter flow
  const [showTwitterFlow, setShowTwitterFlow] = useState(false)

  const { name } = useENS(account)

  return (
    <OutlineCard>
      {showTwitterFlow && account ? (
        <Modal isOpen={true} onDismiss={() => console.log('hi')} minHeight={false} maxHeight={90}>
          <StepsWrapper>
            <TwitterFlow endFlow={() => setShowTwitterFlow(false)} />
          </StepsWrapper>
        </Modal>
      ) : (
        <AutoColumn gap="lg">
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
