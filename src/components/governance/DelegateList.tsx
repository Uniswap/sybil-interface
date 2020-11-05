import React from 'react'
import { AutoColumn } from '../Column'

import { TYPE, ExternalLink } from '../../theme'
import { RowFixed, RowBetween } from '../Row'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { shortenAddress, getEtherscanLink } from '../../utils'
import { useTopDelegates, DelegateData } from '../../state/governance/hooks'
import { WrappedListLogo } from './styled'
import { GreyCard } from '../Card'
import { useActiveWeb3React } from '../../hooks'

export default function DelegateList() {
  const { chainId } = useActiveWeb3React()

  const topDelegates: DelegateData[] | undefined = useTopDelegates()

  return (
    <GreyCard padding="2rem">
      <AutoColumn gap="lg">
        <RowBetween>
          <TYPE.darkGray>Top Delegates</TYPE.darkGray>
          <TYPE.darkGray>Total Votes</TYPE.darkGray>
        </RowBetween>
        {chainId &&
          topDelegates?.map(d => {
            return (
              <RowBetween key={d.id}>
                <RowFixed>
                  <WrappedListLogo src={EmptyProfile} />
                  <AutoColumn gap="6px">
                    <ExternalLink href={getEtherscanLink(chainId, d.id, 'address')}>
                      <TYPE.black>{shortenAddress(d.id)}</TYPE.black>
                    </ExternalLink>
                    <TYPE.black fontSize="10px">EOA</TYPE.black>
                  </AutoColumn>
                </RowFixed>
                <TYPE.black>{parseFloat(d.delegatedVotes.toString()).toFixed(0)} Votes</TYPE.black>
              </RowBetween>
            )
          })}
      </AutoColumn>
    </GreyCard>
  )
}
