import React, { useState, useEffect } from 'react'

import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'
import { X } from 'react-feather'
import { ButtonPrimary } from '../Button'
import { useActiveWeb3React } from '../../hooks'
import AddressInputPanel from '../AddressInputPanel'
import { isAddress } from 'ethers/lib/utils'
import useENS from '../../hooks/useENS'
import { useDelegateCallback, useGovernanceToken, useActiveProtocol } from '../../state/governance/hooks'
import { useTokenBalance } from '../../state/wallet/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
import { Text } from 'rebass'
import { useModalDelegatee } from '../../state/application/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 24px;
`

const StyledClosed = styled(X)`
  :hover {
    cursor: pointer;
  }
`

const TextButton = styled.div`
  :hover {
    cursor: pointer;
  }
`

interface VoteModalProps {
  isOpen: boolean
  onDismiss: () => void
  title: string
}

export default function DelegateModal({ isOpen, onDismiss, title }: VoteModalProps) {
  const { account } = useActiveWeb3React()

  const [prefilledDelegate] = useModalDelegatee()

  // state for delegate input
  const [usingDelegate, setUsingDelegate] = useState(!!!prefilledDelegate)
  const [typed, setTyped] = useState('')
  function handleRecipientType(val: string) {
    setTyped(val)
  }

  // reset modal based on prefilled value or not
  useEffect(() => {
    if (prefilledDelegate) {
      setUsingDelegate(true)
      setTyped(prefilledDelegate)
    } else {
      setTyped('')
      setUsingDelegate(false)
    }
  }, [prefilledDelegate])

  // monitor for self delegation or input for third part delegate
  // default is self delegation
  const activeDelegate = usingDelegate ? typed : account
  const { address: parsedAddress } = useENS(activeDelegate)

  const [activeProtocol] = useActiveProtocol()

  const govToken = useGovernanceToken()

  // get the number of votes available to delegate
  const govTokenBalance = useTokenBalance(account ?? undefined, govToken)

  const delegateCallback = useDelegateCallback()

  // monitor call to help UI loading state
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)

  // wrapper to reset state on modal close
  function wrappedOndismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  async function onDelegate() {
    setAttempting(true)

    // if callback not returned properly ignore
    if (!delegateCallback) return

    // try delegation and store hash
    const hash = await delegateCallback(parsedAddress ?? undefined)?.catch(() => {
      setAttempting(false)
    })

    if (hash) {
      setHash(hash)
    }
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOndismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <AutoColumn gap="lg" justify="center">
            <RowBetween>
              <TYPE.mediumHeader fontWeight={500}>{title}</TYPE.mediumHeader>
              <StyledClosed stroke="black" onClick={wrappedOndismiss} />
            </RowBetween>
            <TYPE.body>
              {activeProtocol?.token?.symbol} tokens represent voting shares in {activeProtocol?.name}.
            </TYPE.body>
            <TYPE.body>
              You can either vote on each proposal yourself or delegate your votes to a third party.
            </TYPE.body>
            {usingDelegate && <AddressInputPanel value={typed} onChange={handleRecipientType} />}
            <ButtonPrimary disabled={!isAddress(parsedAddress ?? '')} onClick={onDelegate}>
              <TYPE.mediumHeader color="white">{usingDelegate ? 'Delegate Votes' : 'Self Delegate'}</TYPE.mediumHeader>
            </ButtonPrimary>
            <TextButton onClick={() => setUsingDelegate(!usingDelegate)}>
              <TYPE.blue>{usingDelegate ? 'Change Delegate' : 'Delegate to an address'}</TYPE.blue>
            </TextButton>
          </AutoColumn>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOndismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>{usingDelegate ? 'Delegating votes' : 'Unlocking Votes'}</TYPE.largeHeader>
            <TYPE.main fontSize={36}>{govTokenBalance?.toSignificant(4)}</TYPE.main>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOndismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.main fontSize={36} textAlign="center">
              {govTokenBalance?.toSignificant(4)} Votes Delegated
            </TYPE.main>
            <ButtonPrimary onClick={wrappedOndismiss} style={{ margin: '20px 0 0 0' }}>
              <Text fontWeight={500} fontSize={20}>
                Close
              </Text>
            </ButtonPrimary>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
