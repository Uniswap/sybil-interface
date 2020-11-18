import React, { useState, useMemo } from 'react'
import Row, { RowBetween, RowFixed } from '../Row'
import { Link, withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE, CloseIcon } from '../../theme'
import { useTwitterProfileData, useVerifiedHandles } from '../../state/social/hooks'
import Modal from '../Modal'
import TwitterFlow from './TwitterFlow'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'
import { useActiveWeb3React } from '../../hooks'
import { useAllTransactions, isTransactionRecent } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { LoaderSecondary } from '../Loader'
import ProfileCard from './ProfileCard'
import { useTwitterAccount } from '../../state/user/hooks'
import moment from 'moment'

const Wrapper = styled.div`
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0px 24px 32px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 0px 1px rgba(0, 0, 0, 0.04);
`

const FixedRowHeight = styled(Row)`
  height: 48px;
`

const RoundedProfileImage = styled.div`
  display: flex;
  align-items; 
  justify-content: center;
  height: 48px;
  width: 48px;
  border-radius: 50%;
  margin-right: 1rem;

  & > img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`

const TwitterLogo = styled.img`
  height: 32px;
  width: 32px;
`

const VerifyButton = styled.a`
  background-color: ${({ theme }) => theme.blue1};
  padding: 4px 1rem;
  outline: none;
  border: none;
  width: fit-content;
  border-radius: 12px;
  white-space: nowrap;
  text-decoration: none;
  font-size: 14px;

  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const PendingFlag = styled.div<{ verified: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme, verified }) => (verified ? theme.green1 : theme.yellow2)};
  color: ${({ theme, verified }) => (verified ? theme.green1 : theme.yellow2)};
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;

  :hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

const StyledClose = styled(CloseIcon)`
  margin-left: 1rem;
  height: 16px;
  width: 16px;
`

// we want the latest one to come first, so return negative if a is after b
export function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

function TwitterAccountDetails() {
  const { account } = useActiveWeb3React()

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  const [twitterAccount, setTwitterAccount] = useTwitterAccount()

  // monitor for pending attempt to verify, pull out profile if so
  const allTransactions = useAllTransactions()
  const sortedRecentTransactions: TransactionDetails[] = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pendingVerifications = sortedRecentTransactions.filter(tx => !tx.receipt && tx.social)
  const pendingProfile = pendingVerifications?.[0]?.social?.username

  // get any verified handles for this user + timestamps they were created at
  const handles = useVerifiedHandles(account)
  const verifiedHandleEntry = handles && twitterAccount ? handles?.find(h => h.handle === twitterAccount) : undefined
  const verified = Boolean(verifiedHandleEntry && !pendingProfile)

  // if pending, wait on that, then if verified handle use that, otherwise wait for logged in username
  const handle = pendingProfile ?? verifiedHandleEntry?.handle ?? twitterAccount

  // get profile data based on handle being used
  const profileData = useTwitterProfileData(handle)

  const verificationDate = verifiedHandleEntry
    ? moment.unix(verifiedHandleEntry.timestamp).format('MMM Do YYYY')
    : undefined

  return (
    <>
      {twitterAccount && (
        <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
          <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} twitterHandle={twitterAccount} />
        </Modal>
      )}
      {!twitterAccount && !verifiedHandleEntry ? (
        <RowBetween>
          <ProfileCard name={profileData?.name} handle={profileData?.handle} imageURL={profileData?.profileURL} />
          <VerifyButton href="http://localhost:8080/login/twitter">
            <RowBetween>
              <TYPE.white>Connect to twitter</TYPE.white>
              <TwitterLogo src={TwitterIcon} />
            </RowBetween>
          </VerifyButton>
        </RowBetween>
      ) : profileData ? (
        <Wrapper>
          <FixedRowHeight>
            <RowBetween>
              <RowFixed>
                <RoundedProfileImage>
                  <img src={profileData.profileURL} alt="profile" />
                </RoundedProfileImage>
                <AutoColumn gap="0.5rem">
                  <RowFixed>
                    <TYPE.body mr="12px" fontSize="18px" fontWeight="500">
                      @{profileData.handle}
                    </TYPE.body>
                    {!handles && !pendingProfile && !verified && (
                      <PendingFlag verified={verified}>
                        Checking verification <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} />
                      </PendingFlag>
                    )}
                    {pendingProfile && (
                      <PendingFlag verified={verified}>
                        Verifying <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} />
                      </PendingFlag>
                    )}
                    {verified && <PendingFlag verified={verified}>Verfied</PendingFlag>}
                    {!verified && !pendingProfile && handles && (
                      <PendingFlag verified={verified} onClick={() => setShowTwitterFlow(true)}>
                        Verify
                      </PendingFlag>
                    )}
                  </RowFixed>
                  {verificationDate ? (
                    <TYPE.black fontSize={12}>Verified on {verificationDate}</TYPE.black>
                  ) : (
                    <TYPE.black fontSize={12}></TYPE.black>
                  )}
                </AutoColumn>
              </RowFixed>
              <RowFixed>
                <TwitterLogo src={TwitterIcon} />
                <Link to="/uniswap">
                  <StyledClose onClick={() => setTwitterAccount(undefined)} />
                </Link>
              </RowFixed>
            </RowBetween>
          </FixedRowHeight>
        </Wrapper>
      ) : (
        ''
      )}
    </>
  )
}

export default withRouter(TwitterAccountDetails)
