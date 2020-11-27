import React, { useState, useEffect } from 'react'
import Row, { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE, ExternalLink } from '../../theme'
import { useTwitterProfileData, useVerifiedHandle } from '../../state/social/hooks'
import Modal from '../Modal'
import TwitterFlow from './TwitterFlow'

import { useActiveWeb3React, useTheme } from '../../hooks'
import { LoaderSecondary } from '../Loader'
import { useTwitterAccount } from '../../state/user/hooks'
import moment from 'moment'
import useParsedQueryString from '../../hooks/useParsedQueryString'
import { ButtonBasic } from '../Button'
import TwitterLoginButton from './TwitterLoginButton'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'

const Wrapper = styled.div`
  border-radius: 10px;
`

const FixedRowHeight = styled(Row)`
  height: 48px;
`

const RoundedProfileImage = styled.div`
  display: flex;
  justify-content: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  margin-right: 1rem;

  & > img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
  }
`

const TwitterLogo = styled.img`
  height: 24px;
  width: 24px;
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
    cursor: ${({ verified }) => !verified && 'pointer'};
    opacity: ${({ verified }) => !verified && '0.6'};
  }
`

const LoadingFlag = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.text3};
  color: ${({ theme }) => theme.text3};
  padding: 4px 8px;
  width: 180px;
  border-radius: 10px;
  font-size: 12px;
`

export default function TwitterAccountDetails() {
  const { account } = useActiveWeb3React()
  const theme = useTheme()

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  // hardcode account if verified in current session
  const [accountOverride, setAccountOverride] = useState<string | undefined>()

  // get any verified handles for this user + timestamps they were created at
  const [twitterAccount] = useTwitterAccount() // logged in account
  const verifiedHandleEntry = useVerifiedHandle(account)

  const loadingVerifiedHandles = verifiedHandleEntry === null
  const profileData = useTwitterProfileData(accountOverride ?? verifiedHandleEntry?.handle)

  const verified = !!accountOverride || !!verifiedHandleEntry

  // parse verfication date, returned in ms convert to seconds
  const verificationDate = verifiedHandleEntry
    ? moment.unix(verifiedHandleEntry.timestamp / 1000).format('MMM Do YYYY')
    : accountOverride
    ? moment.unix(moment.now() / 1000).format('MMM Do YYYY')
    : undefined

  // on redirect from twitter, if signed in, not verified, and no loading, show modal
  const [loaded, setLoaded] = useState(false)
  const { username: usernameQuery } = useParsedQueryString()
  useEffect(() => {
    if (twitterAccount && !verifiedHandleEntry && !loadingVerifiedHandles && !loaded && usernameQuery) {
      setShowTwitterFlow(true)
      setLoaded(true)
    }
  }, [loadingVerifiedHandles, twitterAccount, loaded, usernameQuery, verifiedHandleEntry])

  return (
    <>
      <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
        <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} setAccountOverride={setAccountOverride} />
      </Modal>
      {loadingVerifiedHandles ? (
        <LoadingFlag>
          Loading social data <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} stroke={theme.text3} />
        </LoadingFlag>
      ) : !verified ? (
        !twitterAccount ? (
          <TwitterLoginButton text="Announce yourself as a delegate" />
        ) : (
          <ButtonBasic onClick={() => setShowTwitterFlow(true)} padding="4px 1rem">
            <RowBetween>
              <TYPE.white fontSize="14px">Announce yourself as a delegate</TYPE.white>
              <TwitterLogo src={TwitterIcon} />
            </RowBetween>
          </ButtonBasic>
        )
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
                    <ExternalLink href={'https://twitter.com/' + profileData.handle}>
                      <TYPE.body mr="12px" fontSize="18px" fontWeight="500">
                        @{profileData.handle}
                      </TYPE.body>
                    </ExternalLink>
                    <PendingFlag verified={!!verifiedHandleEntry || !!accountOverride}>Verfied</PendingFlag>
                  </RowFixed>
                  {verificationDate && <TYPE.black fontSize={12}>Verified on {verificationDate}</TYPE.black>}
                </AutoColumn>
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
