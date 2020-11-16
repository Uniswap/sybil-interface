import React, { useState, useMemo } from 'react'
import { AutoColumn } from '../Column'

import { TYPE, ExternalLink } from '../../theme'
import Row, { AutoRow } from '../Row'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { shortenAddress, getEtherscanLink } from '../../utils'
import { DelegateData, useActiveProtocol } from '../../state/governance/hooks'
import { WrappedListLogo } from './styled'
import { GreyCard } from '../Card'
import { useActiveWeb3React } from '../../hooks'
import { ButtonBlue } from '../Button'
import styled from 'styled-components'
import { useModalOpen, useToggleModal } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import DelegateModal from '../vote/DelegateModal'
import { Percent, JSBI } from '@uniswap/sdk'
import Loader from '../Loader'

const ColumnLabel = styled(TYPE.darkGray)`
  white-space: no-wrap;
`

const NoWrap = styled(TYPE.black)`
  white-space: no-wrap;
`

const FixedAddressSize = styled(AutoColumn)`
  width: 120px;
`

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 140px 100px 160px;
  grid-column-gap: 1rem;
  padding: 0 2rem;

  margin: 6px 0;
  border-left: 3px solid transparent;

  :hover {
    border-left: 3px solid ${({ theme }) => theme.primary1};
    cursor: pointer;
  }

  &:first-child {
    :hover {
      border-left: 3px solid transparent;
      cursor: initial;
    }
  }
`

export default function DelegateList({ topDelegates }: { topDelegates: DelegateData[] | undefined }) {
  const { chainId } = useActiveWeb3React()

  // toggle for showing delegation modal
  const showDelegateModal = useModalOpen(ApplicationModal.DELEGATE)
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)

  // used to prefil modal with delegate address
  const [prefilledDelegate, setPrefilledDelegate] = useState<string | undefined>()

  // used to calculate % ownership of votes
  const [activeProtocol] = useActiveProtocol()

  const delegateList = useMemo(() => {
    return (
      chainId &&
      topDelegates &&
      activeProtocol &&
      topDelegates.map((d, i) => {
        return (
          <DataRow key={d.id}>
            <AutoRow gap="10px">
              <NoWrap>{i + 1}</NoWrap>
              <WrappedListLogo src={EmptyProfile} />
              <FixedAddressSize gap="6px">
                <ExternalLink href={getEtherscanLink(chainId, d.id, 'address')}>
                  <TYPE.black>{shortenAddress(d.id)}</TYPE.black>
                </ExternalLink>
                <TYPE.black fontSize="12px">{d.EOA ? 'EOA' : 'Smart Contract'}</TYPE.black>
              </FixedAddressSize>
              <ButtonBlue
                width="fit-content"
                onClick={() => {
                  setPrefilledDelegate(d.id)
                  toggelDelegateModal()
                }}
              >
                Delegate
              </ButtonBlue>
            </AutoRow>
            <NoWrap textAlign="end">{d.votes.length}</NoWrap>
            <NoWrap textAlign="end">
              {new Percent(JSBI.BigInt(d.delegatedVotesRaw), activeProtocol.token.totalSupply).toFixed(3) + '%'}
            </NoWrap>
            <NoWrap textAlign="end">
              {parseFloat(parseFloat(d.delegatedVotes.toString()).toFixed(0)).toLocaleString()} Votes
            </NoWrap>
          </DataRow>
        )
      })
    )
  }, [activeProtocol, chainId, toggelDelegateModal, topDelegates])

  return (
    <GreyCard padding="2rem 0">
      <DelegateModal
        isOpen={showDelegateModal}
        onDismiss={() => {
          setPrefilledDelegate(undefined)
          toggelDelegateModal()
        }}
        title="Delegate Votes"
        prefilledDelegate={prefilledDelegate}
      />
      <AutoColumn gap="lg">
        <DataRow>
          <ColumnLabel>Rank</ColumnLabel>
          <ColumnLabel textAlign="end">Proposals Voted</ColumnLabel>
          <ColumnLabel textAlign="end">Vote Weight</ColumnLabel>
          <ColumnLabel textAlign="end">Total Votes</ColumnLabel>
        </DataRow>
        {delegateList ?? (
          <Row justify="center">
            <Loader />
          </Row>
        )}
      </AutoColumn>
    </GreyCard>
  )
}
