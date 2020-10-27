import React from 'react'
import { AutoColumn } from '../Column'
import { BlurredCard } from '../Card'

import { TYPE, ExternalLink } from '../../theme'
import { RowFixed, RowBetween } from '../Row'
import UniLogo from '../../assets/images/unilogo.svg'
import { WrappedListLogo } from './styled'
import { ChevronDown } from 'react-feather'


export default function ProjectSelector() {
  return (
    <BlurredCard bgColor={"rgba(255,0,122,0.1)"}>
      <AutoColumn gap="lg">
        <RowBetween>
          <RowFixed>
            <WrappedListLogo src={UniLogo} />
            <AutoColumn gap="6px">
              <TYPE.mediumHeader color={"rgba(255,0,122)"}>Uniswap Governance</TYPE.mediumHeader>
              <TYPE.black color={"rgba(255,0,122)"} fontSize="12px">28 public delegates</TYPE.black>
            </AutoColumn>
          </RowFixed>
          <ChevronDown color={"rgba(255,0,122)"}/>
        </RowBetween>
      </AutoColumn>
    </BlurredCard>
  )
}
