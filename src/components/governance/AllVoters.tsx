import React from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, StyledInternalLink } from '../../theme'
import { shortenAddress, isAddress } from '../../utils'
import { useAllPrioritizedNames } from '../../state/social/hooks'
import { useActiveProtocol } from '../../state/governance/hooks'

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
  height: fit-content;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

const TopVoterWrapper = styled.div`
  padding: 1rem 0 0 0;
`

export default function AllVoters({
  title,
  amount,
  allVoters
}: {
  title: string
  amount: number | undefined
  allVoters:
    | {
        votes: string
        voter: {
          id: string
        }
      }[]
    | undefined
}) {
  // format voter name with indentity if it exists
  const [activeProtocol] = useActiveProtocol()

  const names = useAllPrioritizedNames()

  return (
    <StyledDataCard>
      <CardSection>
        <AutoColumn gap="md">
          <RowBetween>
            <TYPE.black fontWeight={600}>{title}</TYPE.black>
            {amount && (
              <TYPE.black fontWeight={600}>{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TYPE.black>
            )}
          </RowBetween>
        </AutoColumn>
        <TopVoterWrapper>
          <AutoColumn gap="1rem">
            {allVoters?.map((p, i) => {
              const formattedName = isAddress(p.voter.id)
              return (
                formattedName && (
                  <RowBetween key={'vote-for-' + i}>
                    <StyledInternalLink to={'/delegates/' + activeProtocol?.id + '/' + p.voter.id}>
                      <TYPE.black fontWeight={400} fontSize="14px">
                        {names?.[formattedName] ?? shortenAddress(formattedName)}
                      </TYPE.black>
                    </StyledInternalLink>
                    <TYPE.black fontWeight={400} fontSize="14px">
                      {parseFloat(p.votes).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TYPE.black>
                  </RowBetween>
                )
              )
            })}
          </AutoColumn>
        </TopVoterWrapper>
      </CardSection>
    </StyledDataCard>
  )
}
