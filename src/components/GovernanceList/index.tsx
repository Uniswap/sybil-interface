import React, { useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'

import { BlurredCard } from '../Card'
import { TYPE, SolidSectionBreak } from '../../theme'
import Row from '../Row'
import UniLogo from '../../assets/images/unilogo.svg'
import DelegateList from './DelegateList'
import { WrappedListLogo } from './styled'

const OptionRow = styled(Row)`
  :hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg3};
  }
`

export enum GovernanceOption {
  Uniswap
}

export default function Overview() {
  const [showDelegates, setShowDelegates] = useState(true)
  const [activePlatform, setActivePlatform] = useState<GovernanceOption | undefined>(GovernanceOption.Uniswap)

  return (
    <BlurredCard>
      {!showDelegates ? (
        <AutoColumn gap="lg">
          <TYPE.mediumHeader>Governance</TYPE.mediumHeader>
          <SolidSectionBreak />
          <OptionRow
            onClick={() => {
              setShowDelegates(true)
              setActivePlatform(GovernanceOption.Uniswap)
            }}
          >
            <WrappedListLogo src={UniLogo} />
            <AutoColumn gap="6px">
              <TYPE.mediumHeader>Uniswap Governance</TYPE.mediumHeader>
              <TYPE.black fontSize="12px">28 public delegates</TYPE.black>
            </AutoColumn>
          </OptionRow>
        </AutoColumn>
      ) : (
        <DelegateList endFlow={() => setShowDelegates(false)} />
      )}
    </BlurredCard>
  )
}
