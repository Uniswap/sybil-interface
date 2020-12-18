import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween, RowFixed } from '../Row'
import { AutoColumn } from '../Column'
import { TYPE, StyledInternalLink } from '../../theme'
import { shortenAddress, isAddress } from '../../utils'
import Modal from '../Modal'
import AllVoters from './AllVoters'
import { ButtonEmpty } from '../Button'
import Loader from '../Loader'
import { useAllVotersForProposal, useActiveProtocol } from '../../state/governance/hooks'
import { useAllPrioritizedNames, useAllIdentities } from '../../state/social/hooks'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'

const DataCard = styled(AutoColumn)<{ disabled?: boolean }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #ff007a 0%, #2172e5 100%);
  border-radius: 12px;
  width: 100%;
  position: relative;
  overflow: hidden;
`

const StyledDataCard = styled(DataCard)`
  width: 100%;
  background: none;
  background-color: ${({ theme }) => theme.bg1};
  height: fit-content;
  z-index: 2;
`

const ProgressWrapper = styled.div`
  width: 100%;
  margin-top: 1rem;
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg3};
  position: relative;
`

const Progress = styled.div<{ status: 'for' | 'against'; percentageString?: string }>`
  height: 4px;
  border-radius: 4px;
  background-color: ${({ theme, status }) => (status === 'for' ? theme.green1 : theme.red1)};
  width: ${({ percentageString }) => percentageString};
`

const WrapSmall = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    align-items: flex-start;
    flex-direction: column;
  `};
`

export const CardSection = styled(AutoColumn)<{ disabled?: boolean }>`
  padding: 1rem;
  z-index: 1;
  opacity: ${({ disabled }) => disabled && '0.4'};
`

const TopVoterWrapper = styled.div`
  padding: 1rem 0 0 0;
`
const TwitterLogo = styled.img`
  height: 24px;
  width: 24px;
`

export default function VoterList({
  title,
  amount,
  percentage,
  voters,
  support,
  id
}: {
  title: string
  amount: number | undefined
  percentage: string
  voters: {
    support: boolean
    votes: string
    voter: {
      id: string
    }
  }[]
  support: 'for' | 'against'
  id: string
}) {
  const [showAll, setShowAll] = useState(false)
  const allVoters = useAllVotersForProposal(id, support === 'for')

  const [activeProtocol] = useActiveProtocol()

  // format voter name with identity if it exists
  const prioritizedNames = useAllPrioritizedNames()

  const [allIdentities] = useAllIdentities()

  console.log(allIdentities)

  return (
    <StyledDataCard>
      <Modal isOpen={showAll} onDismiss={() => setShowAll(false)}>
        <AllVoters title={title} amount={amount} allVoters={allVoters} />
      </Modal>
      <CardSection>
        <AutoColumn gap="md">
          <WrapSmall>
            <TYPE.black fontWeight={600}>{title}</TYPE.black>
            {amount || amount === 0 ? (
              <TYPE.black fontWeight={600}>{amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</TYPE.black>
            ) : (
              <Loader />
            )}
          </WrapSmall>
        </AutoColumn>
        <ProgressWrapper>
          <Progress status={support} percentageString={percentage} />
        </ProgressWrapper>
        <TopVoterWrapper>
          <AutoColumn gap="1rem">
            <RowBetween>
              <TYPE.main fontWeight={400} fontSize="14px">
                Top Voters
              </TYPE.main>
              <div />
            </RowBetween>
            {voters.map((p, i) => {
              const formattedName = isAddress(p.voter.id)
              const twitterName = formattedName && allIdentities?.[formattedName]?.twitter?.handle
              return (
                <RowBetween key={'vote-for-' + i}>
                  <StyledInternalLink to={'/delegates/' + activeProtocol?.id + '/' + p.voter.id}>
                    <TYPE.black fontWeight={400} fontSize="14px">
                      {twitterName ? (
                        <RowFixed>
                          @{twitterName}
                          <TwitterLogo src={TwitterIcon} />{' '}
                        </RowFixed>
                      ) : (
                        prioritizedNames?.[p.voter.id] ?? shortenAddress(p.voter.id)
                      )}
                    </TYPE.black>
                  </StyledInternalLink>
                  <TYPE.black fontWeight={400} fontSize="14px">
                    {parseFloat(p.votes).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TYPE.black>
                </RowBetween>
              )
            })}
            <ButtonEmpty onClick={() => setShowAll(true)}>
              <TYPE.black fontWeight={600} fontSize="14px" textAlign="center">
                View All
              </TYPE.black>
            </ButtonEmpty>
          </AutoColumn>
        </TopVoterWrapper>
      </CardSection>
    </StyledDataCard>
  )
}
