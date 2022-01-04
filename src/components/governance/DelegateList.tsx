import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE, BlankInternalLink, OnlyAboveExtraSmall, OnlyAboveSmall, OnlyAboveLarge } from '../../theme'
import Row, { AutoRow, RowBetween, RowFixed } from '../Row'
import EmptyProfile from '../../assets/images/emptyprofile.png'
import { shortenAddress } from '../../utils'
import useENSName from '../../hooks/useENSName'
import {
  useActiveProtocol,
  useGlobalData,
  useGovernanceToken,
  useFilterActive,
  useTopDelegates,
  useUserDelegatee,
  useVerifiedDelegates,
  DelegateData,
  useMaxFetched,
} from '../../state/governance/hooks'
import { WrappedListLogo, RoundedProfileImage, DelegateButton, EmptyWrapper } from './styled'
import Card from '../Card'
import { useActiveWeb3React } from '../../hooks'
import { useToggleModal, useModalDelegatee } from '../../state/application/hooks'
import { ApplicationModal } from '../../state/application/actions'
import { Percent, JSBI } from '@uniswap/sdk'
import { LoadingRows } from '../Loader'
import { BIG_INT_ZERO } from '../../constants'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useAllIdentities, useTwitterProfileData } from '../../state/social/hooks'
import { nameOrAddress } from '../../utils/getName'
import { FETCHING_INTERVAL } from '../../state/governance/reducer'
import Toggle from 'components/Toggle'

const ColumnLabel = styled(TYPE.darkGray)`
  white-space: no-wrap;
  font-size: 15px;
`

const NoWrap = styled(TYPE.black)`
  white-space: nowrap;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`

const DataRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 132px 100px 1fr;
  grid-column-gap: 1rem;

  position: relative;
  margin: 6px 0;
  border-left: 3px solid transparent;

  :hover::after {
    content: '';
    border-left: 3px solid ${({ theme }) => theme.primary1};
    position: absolute;
    margin-left: calc(-2rem - 4px);
    height: 100%;
    width: 1px;
  }

  &:first-child {
    :hover {
      border-left: 3px solid transparent;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToExtraLarge`
    grid-template-columns: 1fr 100px 1fr;
     > *:nth-child(2){
      display: none;
    }
  `};

  @media (max-width: 1370px) {
    grid-template-columns: 1fr 1fr;
    padding: 0 0.5rem;
    > *:nth-child(3) {
      display: none;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
    grid-template-columns: 1fr 1fr;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 1fr 1fr;
    margin: 0;
    padding: 0 1rem;
  `};
`

const AccountLinkGroup = styled(AutoRow)`
  :hover {
    /* opacity: 0.5; */
    /* border-radius: 8px; */
  }

  flex-wrap: nowrap;
`

const VoteText = styled(NoWrap)`
  width: 120px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

const FixedRankWidth = styled.div`
  width: 12px;
  text-align: right;
  margin-right: 0px;
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
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const HiddenBelow1080 = styled.span`
  @media (max-width: 1080px) {
    display: none;
  }
`

const ResponsiveText = styled(TYPE.black)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

export const Break = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.bg3};
  height: 1px;
  margin: 12px 0;
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

  // filter on verified or not
  const [filter, setFilter] = useFilterActive()

  const manualEntries = useMemo(() => {
    return allIdentities && filteredDelegates
      ? Object.keys(allIdentities)
          .filter((address) => {
            const found = filteredDelegates.find((d) => d.id === address)
            return !found
          })
          .map((address: any) => {
            const identity = allIdentities[address]
            return { handle: identity?.twitter?.handle ?? undefined, address }
          })
      : []
  }, [allIdentities, filteredDelegates])

  const formattedManualDelegates: DelegateData[] = useMemo(() => {
    return manualEntries.map((entry) => {
      return {
        id: entry.address,
        delegatedVotes: 0,
        delegatedVotesRaw: 0,
        votePercent: new Percent(BIG_INT_ZERO),
        votes: [],
        EOA: true,
        autonomous: undefined,
        handle: entry.handle,
        imageURL: undefined,
      }
    })
  }, [manualEntries])

  const [page, setPage] = useState(1)
  const [maxFetched, setMaxFetched] = useMaxFetched()

  const combinedDelegates = filterActive ? filteredDelegates?.concat(formattedManualDelegates) : filteredDelegates

  const maxCount = filterActive
    ? combinedDelegates
      ? combinedDelegates.filter((d) => (hideZero ? !!(d.delegatedVotesRaw > 1) : true)).length
      : 0
    : globalData
    ? globalData.totalDelegates
    : 1

  const maxPage = maxCount ? Math.floor(maxCount / FETCHING_INTERVAL) + 1 : 1

  const DelegateRow = ({ d, index }: { d: DelegateData; index: number }) => {
    const votes = parseFloat(parseFloat(d.delegatedVotes.toString()).toFixed(0)).toLocaleString()
    const twitterData = useTwitterProfileData(allIdentities?.[d.id]?.twitter?.handle)
    const imageURL = d.imageURL ?? twitterData?.profileURL ?? undefined
    const isDelegatee = userDelegatee ? userDelegatee.toLowerCase() === d.id.toLowerCase() : false

    const { ENSName } = useENSName(d.id ?? undefined)
    const name = nameOrAddress(d.id, allIdentities, true, d.autonomous, ENSName)

    const percentOfVotes = globalData
      ? globalData.delegatedVotesRaw === 0
        ? 0
        : new Percent(JSBI.BigInt(d.delegatedVotesRaw), JSBI.BigInt(globalData.delegatedVotesRaw)).toFixed(3) + '%'
      : '-'

    return (
      <AutoColumn>
        <DataRow>
          <AutoRow gap="10px" style={{ flexWrap: 'nowrap' }}>
            <HiddenBelow1080>
              <FixedRankWidth>
                <NoWrap>{(page - 1) * FETCHING_INTERVAL + (index + 1)}</NoWrap>
              </FixedRankWidth>
            </HiddenBelow1080>
            <BlankInternalLink to={activeProtocol?.id + '/' + d.id}>
              <AccountLinkGroup gap="10px" width="initial">
                <HiddenBelow1080>
                  {imageURL ? (
                    <RoundedProfileImage>
                      <img src={imageURL} alt="profile" />
                    </RoundedProfileImage>
                  ) : (
                    <WrappedListLogo src={EmptyProfile} alt="profile" style={{ opacity: '0.2' }} />
                  )}
                </HiddenBelow1080>
                <AutoColumn gap="6px">
                  <ResponsiveText style={{ fontWeight: 500 }}>{name}</ResponsiveText>
                  {d.handle || d.autonomous || shortenAddress(d.id) !== name ? (
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
          <NoWrap textAlign="end">{d.votes.length}</NoWrap>
          <NoWrap textAlign="end">{percentOfVotes}</NoWrap>
          <Row style={{ justifyContent: 'flex-end' }}>
            <OnlyAboveExtraSmall>
              <DelegateButton
                width="fit-content"
                mr="24px"
                disabled={!showDelegateButton || isDelegatee}
                onClick={() => {
                  setPrefilledDelegate(d.id)
                  toggelDelegateModal()
                }}
              >
                {isDelegatee ? 'Delegated' : 'Delegate'}
              </DelegateButton>
            </OnlyAboveExtraSmall>
            <VoteText textAlign="end">
              {votes === '0' ? '0 Votes' : votes + (votes === '1' ? ' Vote' : ' Votes')}
            </VoteText>
          </Row>
        </DataRow>
        <Break />
      </AutoColumn>
    )
  }

  const delegateList = useMemo(() => {
    return chainId && combinedDelegates && activeProtocol
      ? combinedDelegates
          // filter for non zero votes
          // eslint-disable-next-line react/prop-types
          .filter((d) => (hideZero ? !!(d.delegatedVotesRaw > 1) : true))
          .slice((page - 1) * FETCHING_INTERVAL, (page - 1) * FETCHING_INTERVAL + FETCHING_INTERVAL)
          .map((d, i) => {
            return <DelegateRow d={d} index={i} key={i} />
          })
      : null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, combinedDelegates, activeProtocol, page, hideZero])

  return combinedDelegates && combinedDelegates.length === 0 ? (
    <Card padding="20px">
      <EmptyWrapper>
        <TYPE.body style={{ marginBottom: '8px' }}>No delegates yet.</TYPE.body>
        <TYPE.subHeader>
          <i>Community members with delegated votes will appear here.</i>
        </TYPE.subHeader>
      </EmptyWrapper>
    </Card>
  ) : (
    <Card padding="0">
      <OnlyAboveLarge>
        <RowBetween style={{ marginBottom: '32px', alignItems: 'flex-start' }}>
          <TYPE.body fontSize="16px" fontWeight="600">
            Top Delegates
          </TYPE.body>
          <OnlyAboveSmall>
            <RowFixed>
              <Toggle isActive={filter} toggle={() => setFilter(!filter)} />
            </RowFixed>
          </OnlyAboveSmall>
        </RowBetween>
      </OnlyAboveLarge>
      <AutoColumn gap="0">
        <DataRow>
          <ColumnLabel>Rank</ColumnLabel>
          <ColumnLabel textAlign="end">Proposals Voted</ColumnLabel>
          <ColumnLabel textAlign="end">Vote Weight</ColumnLabel>
          <ColumnLabel textAlign="end">Total Votes</ColumnLabel>
        </DataRow>
        <Break />
        {combinedDelegates && combinedDelegates?.length > 0 ? (
          delegateList
        ) : (
          <LoadingRows>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </LoadingRows>
        )}
      </AutoColumn>
      {combinedDelegates && combinedDelegates?.length > 0 && (
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
      )}
    </Card>
  )
}
