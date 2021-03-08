import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE, BlankInternalLink, OnlyAboveSmall, OnlyAboveLarge } from '../../theme'
import Row, { AutoRow } from '../Row'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { shortenAddress } from '../../utils'
import {
  useActiveProtocol,
  useGlobalData,
  useGovernanceToken,
  useFilterActive,
  useTopDelegates,
  useUserDelegatee,
  useVerifiedDelegates,
  DelegateData,
  useMaxFetched
} from '../../state/governance/hooks'
import { WrappedListLogo, RoundedProfileImage, DelegateButton, EmptyWrapper } from './styled'
import { GreyCard } from '../Card'
import { useActiveWeb3React } from '../../hooks'
import { useToggleModal, useModalDelegatee } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import { Percent, JSBI } from '@uniswap/sdk'
import Loader from '../Loader'
import { BIG_INT_ZERO } from '../../constants'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useAllIdentities, useTwitterProfileData } from '../../state/social/hooks'
import { nameOrAddress } from '../../utils/getName'
import { FETCHING_INTERVAL } from '../../state/governance/reducer'

const ColumnLabel = styled(TYPE.darkGray)`
  white-space: no-wrap;
  font-size: 15px;
`

const NoWrap = styled(TYPE.black)`
  white-space: nowrap;
`

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 132px 100px 1fr;
  grid-column-gap: 1rem;
  padding: 0 1.5rem;

  margin: 6px 0;
  border-left: 3px solid transparent;

  :hover {
    border-left: 3px solid ${({ theme }) => theme.primary1};
  }

  &:first-child {
    :hover {
      border-left: 3px solid transparent;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
  grid-template-columns: 1fr 1fr;
    margin: 0;
    padding: 0 1.5rem;
  `};
`

const AccountLinkGroup = styled(AutoRow)`
  :hover {
    opacity: 0.5;
    border-radius: 8px;
  }

  flex-wrap: nowrap;
`

const VoteText = styled(NoWrap)`
  width: 140px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
  `};
`

const FixedRankWidth = styled.div`
  width: 20px;
  text-align: right;
  margin-right: 12px;
`

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 0.5em;
`
const Arrow = styled.div<{ faded?: boolean }>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

export default function DelegateList({ hideZero }: { hideZero: boolean }) {
  const { chainId, account } = useActiveWeb3React()

  // get delegate lists, filter if active
  const [topDelegates] = useTopDelegates()
  const [verifiedDelegates] = useVerifiedDelegates()
  const [filterActive] = useFilterActive()
  const filteredDelegates = filterActive ? verifiedDelegates : topDelegates

  // toggle for showing delegation modal with prefilled delegate
  const toggelDelegateModal = useToggleModal(ApplicationModal.DELEGATE)
  const [, setPrefilledDelegate] = useModalDelegatee()

  // used to calculate % ownership of votes
  const [activeProtocol] = useActiveProtocol()
  const [globalData] = useGlobalData()

  // show delegate button if they have available votes or if theyve delegated to someone else
  const govToken = useGovernanceToken()
  const govTokenBalance = useTokenBalance(account ?? undefined, govToken)
  const showDelegateButton = Boolean(govTokenBalance && JSBI.greaterThan(govTokenBalance.raw, BIG_INT_ZERO))

  // user gov data
  const userDelegatee: string | undefined = useUserDelegatee()

  // show indentity if it exists instead of address
  const [allIdentities] = useAllIdentities()

  const manualEntries = useMemo(() => {
    return allIdentities && filteredDelegates
      ? Object.keys(allIdentities)
          .filter(address => {
            const found = filteredDelegates.find(d => d.id === address)
            return !found
          })
          .map((address: any) => {
            const identity = allIdentities[address]
            return { handle: identity?.twitter?.handle ?? undefined, address }
          })
      : []
  }, [allIdentities, filteredDelegates])

  const formattedManualDelegates: DelegateData[] = useMemo(() => {
    return manualEntries.map(entry => {
      return {
        id: entry.address,
        delegatedVotes: 0,
        delegatedVotesRaw: 0,
        votePercent: new Percent(BIG_INT_ZERO),
        votes: [],
        EOA: true,
        autonomous: undefined,
        handle: entry.handle,
        imageURL: undefined
      }
    })
  }, [manualEntries])

  const [page, setPage] = useState(1)
  const [maxFetched, setMaxFetched] = useMaxFetched()

  const combinedDelegates = filterActive ? filteredDelegates?.concat(formattedManualDelegates) : filteredDelegates

  const maxCount = filterActive
    ? combinedDelegates
      ? combinedDelegates.filter(d => (hideZero ? !!(d.delegatedVotesRaw > 1) : true)).length
      : 0
    : globalData
    ? globalData.totalDelegates
    : 1

  const maxPage = maxCount ? Math.floor(maxCount / FETCHING_INTERVAL) + 1 : 1

  const DelegateRow = ({ d, index }: { d: DelegateData; index: number }) => {
    const name = nameOrAddress(d.id, allIdentities, true, d.autonomous)
    const votes = parseFloat(parseFloat(d.delegatedVotes.toString()).toFixed(0)).toLocaleString()
    const twitterData = useTwitterProfileData(allIdentities?.[d.id]?.twitter?.handle)
    const imageURL = d.imageURL ?? twitterData?.profileURL ?? undefined
    const isDelegatee = userDelegatee ? userDelegatee.toLowerCase() === d.id.toLowerCase() : false

    return (
      <DataRow>
        <AutoRow gap="10px" style={{ flexWrap: 'nowrap' }}>
          <OnlyAboveSmall>
            <FixedRankWidth>
              <NoWrap>{(page - 1) * FETCHING_INTERVAL + (index + 1)}</NoWrap>
            </FixedRankWidth>
          </OnlyAboveSmall>
          <BlankInternalLink to={activeProtocol?.id + '/' + d.id}>
            <AccountLinkGroup gap="10px" width="initial">
              <OnlyAboveSmall>
                {imageURL ? (
                  <RoundedProfileImage>
                    <img src={imageURL} alt="profile" />
                  </RoundedProfileImage>
                ) : (
                  <WrappedListLogo src={EmptyProfile} alt="profile" style={{ opacity: '0.2' }} />
                )}
              </OnlyAboveSmall>
              <AutoColumn gap="6px">
                <TYPE.black style={{ fontWeight: imageURL ? 500 : 400 }}>{name}</TYPE.black>
                {d.handle || d.autonomous ? (
                  <TYPE.black fontSize="12px">{shortenAddress(d.id)}</TYPE.black>
                ) : (
                  <TYPE.black fontSize="12px" style={{ opacity: '0.6' }}>
                    {d.EOA ? '👤 EOA' : ' 📜 Smart Contract'}
                  </TYPE.black>
                )}
              </AutoColumn>
            </AccountLinkGroup>
          </BlankInternalLink>
        </AutoRow>
        <OnlyAboveLarge>
          <NoWrap textAlign="end">{d.votes.length}</NoWrap>
        </OnlyAboveLarge>
        <OnlyAboveLarge>
          <NoWrap textAlign="end">
            {globalData
              ? new Percent(JSBI.BigInt(d.delegatedVotesRaw), JSBI.BigInt(globalData.delegatedVotesRaw)).toFixed(3) +
                '%'
              : '-'}
          </NoWrap>
        </OnlyAboveLarge>
        <Row style={{ justifyContent: 'flex-end' }}>
          <OnlyAboveSmall>
            <DelegateButton
              width="fit-content"
              mr="10px"
              disabled={!showDelegateButton || isDelegatee}
              onClick={() => {
                setPrefilledDelegate(d.id)
                toggelDelegateModal()
              }}
            >
              {isDelegatee ? 'Delegated' : 'Delegate'}
            </DelegateButton>
          </OnlyAboveSmall>
          <VoteText textAlign="end">
            {votes === '0' ? '0 Votes' : votes + (votes === '1' ? ' Vote' : ' Votes')}
          </VoteText>
        </Row>
      </DataRow>
    )
  }

  const delegateList = useMemo(() => {
    return chainId && combinedDelegates && activeProtocol
      ? combinedDelegates
          // filter for non zero votes
          // eslint-disable-next-line react/prop-types
          .filter(d => (hideZero ? !!(d.delegatedVotesRaw > 1) : true))
          .slice((page - 1) * FETCHING_INTERVAL, (page - 1) * FETCHING_INTERVAL + FETCHING_INTERVAL)
          .map((d, i) => {
            return <DelegateRow d={d} index={i} key={i} />
          })
      : null
  }, [chainId, activeProtocol, combinedDelegates, page, hideZero])

  return combinedDelegates && combinedDelegates.length === 0 ? (
    <GreyCard padding="20px">
      <EmptyWrapper>
        <TYPE.body style={{ marginBottom: '8px' }}>No delegates yet.</TYPE.body>
        <TYPE.subHeader>
          <i>Community members with delegated votes will appear here.</i>
        </TYPE.subHeader>
      </EmptyWrapper>
    </GreyCard>
  ) : (
    <GreyCard padding="1rem 0">
      <AutoColumn gap="lg">
        <DataRow>
          <ColumnLabel>Rank</ColumnLabel>
          <OnlyAboveLarge>
            <ColumnLabel textAlign="end">Proposals Voted</ColumnLabel>
          </OnlyAboveLarge>
          <OnlyAboveLarge>
            <ColumnLabel textAlign="end">Vote Weight</ColumnLabel>
          </OnlyAboveLarge>
          <ColumnLabel textAlign="end">Total Votes</ColumnLabel>
        </DataRow>

        {combinedDelegates && combinedDelegates?.length > 0 ? (
          delegateList
        ) : (
          <Row justify="center">
            <Loader />
          </Row>
        )}
      </AutoColumn>
      <PageButtons>
        <div
          onClick={() => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div
          onClick={() => {
            setPage(page === maxPage ? page : page + 1)
            page !== maxPage && maxFetched && setMaxFetched(maxFetched + FETCHING_INTERVAL)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </GreyCard>
  )
}
