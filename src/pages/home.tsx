import React from 'react'
import { BodyWrapper } from './AppBody'
import AccountAttestation from '../components/AccountAttestation'
import { GreyCard } from '../components/Card'
import { AutoColumn } from '../components/Column'
import { TYPE, SolidSectionBreak } from '../theme'
import { RowBetween } from '../components/Row'

export default function Home() {
  return (
    <BodyWrapper>
      <AutoColumn gap="lg">
        <AccountAttestation />
        <GreyCard>
          <AutoColumn gap="lg">
            <RowBetween>
              <TYPE.mediumHeader>How it works</TYPE.mediumHeader>
              <TYPE.mediumHeader>?</TYPE.mediumHeader>
            </RowBetween>
            <SolidSectionBreak />
            <AutoColumn gap="md">
              <TYPE.black>
                This tool connects a wallet address to a digital identity by singing a message on chain.
              </TYPE.black>
              <TYPE.black>
                This mapping of address identity can be updated, removed and queried on chain using any ethereum
                indexer.
              </TYPE.black>
              <TYPE.black>
                This mapping can be used for displaying public identies for governance platforms on ethereum.
              </TYPE.black>
            </AutoColumn>
          </AutoColumn>
        </GreyCard>
      </AutoColumn>
    </BodyWrapper>
  )
}
