import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, ExternalLink } from '../../theme'
import { getEtherscanLink, shortenAddress } from '../../utils'
import { ChainId } from '@uniswap/sdk'
import { useAllVotersForProposal } from '../../state/governance/hooks'

const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #2172e5 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: auto;
`

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: 400px;
  z-index: 2;
  padding: 1rem;
  overflow: auto;
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

const TopVoterWrapper = styled.div`
  padding: 1rem 0 0 0;
`

export default function AllVoters({
  title,
  amount,
  proposalID,
  support
}: {
  title: string
  amount: number
  proposalID: string
  support: boolean
}) {
  const allVoters = useAllVotersForProposal(proposalID, support)

  return (
    <StyledDataCard>
      <CardSection>
        <AutoColumn gap="md">
          <RowBetween>
            <TYPE.black fontWeight={600}>{title}</TYPE.black>
            <TYPE.black fontWeight={600}>{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TYPE.black>
          </RowBetween>
        </AutoColumn>
        <TopVoterWrapper>
          <AutoColumn gap="1rem">
            {allVoters?.map((p, i) => {
              return (
                <RowBetween key={'vote-for-' + i}>
                  <ExternalLink href={getEtherscanLink(ChainId.MAINNET, p.voter.id, 'address')}>
                    <TYPE.black fontWeight={400} fontSize="14px">
                      {shortenAddress(p.voter.id)}
                    </TYPE.black>
                  </ExternalLink>
                  <TYPE.black fontWeight={400} fontSize="14px">
                    {parseFloat(p.votes).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TYPE.black>
                </RowBetween>
              )
            })}
          </AutoColumn>
        </TopVoterWrapper>
      </CardSection>
    </StyledDataCard>
  )
}
