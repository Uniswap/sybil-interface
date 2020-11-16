import React, { useState, useMemo } from 'react'
import Row, { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import { useTwitterProfileData, useVerifiedHandles } from '../../state/social/hooks'
import Modal from '../Modal'
import TwitterFlow from './TwitterFlow'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'
import { useActiveWeb3React } from '../../hooks'
import { useAllTransactions, isTransactionRecent } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { LoaderSecondary } from '../Loader'

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
  height: 40px;
  width: 40px;
`

const VerifyButton = styled.button`
  background-color: ${({ theme }) => theme.blue1};
  padding: 2px 20px;
  outline: none;
  border: none;
  border-radius: 1rem;
  :hover {
    cursor: pointer;
    opacity: 0.8;
  }
`

const PendingFlag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.yellow2};
  color: ${({ theme }) => theme.yellow2};
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
`

// we want the latest one to come first, so return negative if a is after b
export function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export default function TwitterAccountSection() {
  const { account } = useActiveWeb3React()

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  // monitor for pending attempt to verify, pull out profile if so
  const allTransactions = useAllTransactions()
  const sortedRecentTransactions: TransactionDetails[] = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pendingVerifications = sortedRecentTransactions.filter(tx => !tx.receipt && tx.social)
  const pendingProfile = pendingVerifications?.[0]?.social?.username

  // get any verified handles for this user
  const handles = useVerifiedHandles(account)
  const verifiedHandle = handles ? handles?.[0] : undefined // just show first handle found for now

  // if pending profile, fetch data with that - else use the verified handle
  const profileData = useTwitterProfileData(pendingProfile ?? verifiedHandle)

  return (
    <>
      <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
        <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} />
      </Modal>
      {!profileData ? (
        <VerifyButton onClick={() => setShowTwitterFlow(true)}>
          <RowBetween>
            <TYPE.white>Announce yourself as a delegate</TYPE.white>
            <TwitterLogo src={TwitterIcon} />
          </RowBetween>
        </VerifyButton>
      ) : (
        <Wrapper>
          <FixedRowHeight>
            <RowBetween>
              <RowFixed>
                <RoundedProfileImage>
                  <img src={profileData.profileURL} alt="profile" />
                </RoundedProfileImage>
                <AutoColumn gap="0.5rem">
                  <RowFixed>
                    <TYPE.mediumHeader mr={pendingProfile ? '12px' : '0'}>{profileData.name}</TYPE.mediumHeader>
                    {pendingProfile && (
                      <PendingFlag>
                        Verifying <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} />
                      </PendingFlag>
                    )}
                  </RowFixed>
                  <TYPE.black fontSize={12}>@{profileData.handle}</TYPE.black>
                </AutoColumn>
              </RowFixed>
              <TwitterLogo src={TwitterIcon} />
            </RowBetween>
          </FixedRowHeight>
        </Wrapper>
      )}
    </>
  )
}
