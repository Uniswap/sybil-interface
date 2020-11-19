import React, { useState, useEffect } from 'react'
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
import { useUserPendingUsername } from '../../state/transactions/hooks'
import { LoaderSecondary } from '../Loader'
import ProfileCard from './ProfileCard'
import { useTwitterAccount } from '../../state/user/hooks'
import moment from 'moment'
import { ButtonBasic } from '../Button'
import useParsedQueryString from '../../hooks/useParsedQueryString'

const Wrapper = styled.div`
  padding: 1rem;
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.05);
`

const FixedRowHeight = styled(Row)`
  height: 48px;
`

const RoundedProfileImage = styled.div`
  display: flex;
  justify-content: center;
  height: 24px;
  width: 24px;
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
    cursor: ${({ verified }) => !verified && 'pointer'};
    opacity: ${({ verified }) => !verified && '0.6'};
  }
`

const StyledClose = styled(CloseIcon)`
  margin-left: 1rem;
  height: 16px;
  width: 16px;
`

function TwitterAccountPreview() {
  const { account } = useActiveWeb3React()

  // toggle modal for twitter verification
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  const [twitterAccount, setTwitterAccount] = useTwitterAccount()

  // monitor for pending attempt to verify, pull out profile if so
  const { pendingProfile } = useUserPendingUsername()

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

  // on redirect from twitter, if signed in, not verified, and no loading, show modal
  const [loaded, setLoaded] = useState(false)
  const { username: usernameQuery } = useParsedQueryString()
  useEffect(() => {
    if (twitterAccount && !verified && handles && !loaded && usernameQuery) {
      setShowTwitterFlow(true)
      setLoaded(true)
    }
  }, [handles, twitterAccount, verified, loaded, usernameQuery])

  function getFlagOrButton() {
    // data not loaded yet and nothing verified
    if (!handles && !pendingProfile && !verified) {
      return (
        <PendingFlag verified={verified}>
          Checking verification <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} />
        </PendingFlag>
      )
    }
    // pending handle, waiting for txn confirmation
    if (pendingProfile) {
      return (
        <PendingFlag verified={verified}>
          Verifying <LoaderSecondary size={'12px'} style={{ marginLeft: '6px' }} />
        </PendingFlag>
      )
    }
    // verified handle
    if (verified) {
      return <PendingFlag verified={verified}>Verfied</PendingFlag>
    }
    // data is loaded but not handle mappings yet
    if (!verified && !pendingProfile && handles) {
      return (
        <ButtonBasic onClick={() => setShowTwitterFlow(true)} padding="4px 8px" borderRadius="10px">
          <TYPE.white fontSize="12px">Verifiy identity</TYPE.white>
        </ButtonBasic>
      )
    }
    return null
  }

  return (
    <>
      {twitterAccount && (
        <Modal isOpen={showTwitterFlow} onDismiss={() => setShowTwitterFlow(false)}>
          <TwitterFlow onDismiss={() => setShowTwitterFlow(false)} />
        </Modal>
      )}
      {!twitterAccount && !verifiedHandleEntry ? (
        <RowBetween>
          <ProfileCard name={profileData?.name} handle={profileData?.handle} imageURL={profileData?.profileURL} />
          <VerifyButton href="http://localhost:8080/login/twitter">
            <RowBetween>
              <TYPE.white>Announce yourseld as a delegate</TYPE.white>
              <TwitterLogo src={TwitterIcon} />
            </RowBetween>
          </VerifyButton>
        </RowBetween>
      ) : profileData ? (
        <Wrapper>
          <RowBetween>
            <RowFixed>
              <RoundedProfileImage>
                <img src={profileData.profileURL} alt="profile" />
              </RoundedProfileImage>
              <AutoColumn>
                <RowFixed>
                  <TYPE.body mr="12px" fontSize="18px" fontWeight="500">
                    @{profileData.handle}
                  </TYPE.body>
                  <PendingFlag verified={verified}>Unverified</PendingFlag>
                </RowFixed>
                {verificationDate ? (
                  <TYPE.black fontSize={12}>Verified on {verificationDate}</TYPE.black>
                ) : (
                  <TYPE.black fontSize={12}></TYPE.black>
                )}
              </AutoColumn>
            </RowFixed>
            {/* <RowFixed>
                <TwitterLogo src={TwitterIcon} />
                <Link to="/uniswap">
                  <StyledClose onClick={() => setTwitterAccount(undefined)} />
                </Link>
              </RowFixed> */}
          </RowBetween>
        </Wrapper>
      ) : (
        ''
      )}
    </>
  )
}

export default withRouter(TwitterAccountPreview)
