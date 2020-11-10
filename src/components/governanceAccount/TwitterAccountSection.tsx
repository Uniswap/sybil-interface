import React, { useState } from 'react'
import Row, { RowBetween, RowFixed } from '../Row'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'
import { useVerifiedHandle, useTwitterProfileData } from '../../state/social/hooks'
import Modal from '../Modal'
import TwitterFlow from './TwitterFlow'
import { useActiveWeb3React } from '../../hooks'
import TwitterIcon from '../../assets/images/Twitter_Logo_Blue.png'

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

export default function TwitterAccountSection() {
  const { account } = useActiveWeb3React()

  // if not attested, show twitter flow
  const [showTwitterFlow, setShowTwitterFlow] = useState<boolean>(false)

  // check kv list for handle, then fetch profile info from twitter
  const verifiedHandle = useVerifiedHandle(account)
  const profileData = useTwitterProfileData(verifiedHandle)

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
                  <TYPE.mediumHeader>{profileData.name}</TYPE.mediumHeader>
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
