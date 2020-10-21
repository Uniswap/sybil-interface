import React from 'react'
import { AutoColumn } from '../Column'

import { TYPE, SolidSectionBreak, BackArrowSimple, ExternalLink } from '../../theme'
import { RowFixed, RowBetween } from '../Row'
import UniLogo from '../../assets/images/unilogo.svg'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { WrappedListLogo } from './styled'
import { shortenAddress } from '../../utils'
import { useTopDelegates, DelegateData } from '../../state/delegates/hooks'

export default function DelegateList({ endFlow }: { endFlow: () => void }) {
  const topDelegates: DelegateData[] | undefined = useTopDelegates()

  return (
    <AutoColumn gap="lg">
      <RowFixed>
        <BackArrowSimple onClick={endFlow} />
        <TYPE.mediumHeader>Back to lists</TYPE.mediumHeader>
      </RowFixed>
      <SolidSectionBreak />
      <RowBetween>
        <RowFixed>
          <WrappedListLogo src={UniLogo} />
          <AutoColumn gap="6px">
            <TYPE.mediumHeader>Uniswap Governance</TYPE.mediumHeader>
            <TYPE.black fontSize="12px">28 public delegates</TYPE.black>
          </AutoColumn>
        </RowFixed>
        <ExternalLink href="">Homepage ↗</ExternalLink>
      </RowBetween>
      <SolidSectionBreak />
      <TYPE.mediumHeader>Top Delegates</TYPE.mediumHeader>
      {topDelegates?.map(d => {
        return (
          <RowBetween key={d.id}>
            <RowFixed>
              <WrappedListLogo src={EmptyProfile} />
              <AutoColumn gap="6px">
                <TYPE.mediumHeader>{shortenAddress(d.id)}</TYPE.mediumHeader>
                <TYPE.black fontSize="10px">EOA</TYPE.black>
              </AutoColumn>
            </RowFixed>
            <TYPE.black>{parseFloat(d.delegatedVotes.toString()).toFixed(0)} Votes</TYPE.black>
          </RowBetween>
        )
      })}
    </AutoColumn>
  )
}
