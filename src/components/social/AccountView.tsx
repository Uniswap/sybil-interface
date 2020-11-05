import React from 'react'
import Row from '../Row'
import styled from 'styled-components'
import { AutoColumn } from '../Column'
import { TYPE } from '../../theme'

const EmptyCircle = styled.div`
  height: 48px;
  width: 48px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 50%;
  margin-right: 1rem;
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

const FadedDetails = styled(AutoColumn)`
  opacity: 0.4;
`

interface AccountViewProps {
  name: string | undefined
  handle: string | undefined
  imageURL: string | undefined
}

export default function TwitterAccountView({ name, handle, imageURL }: AccountViewProps) {
  return !handle ? (
    <FixedRowHeight>
      <EmptyCircle />
      <FadedDetails gap="0.5rem">
        <TYPE.mediumHeader>Account</TYPE.mediumHeader>
        <TYPE.black fontSize={12}>Linked accounts will appear here</TYPE.black>
      </FadedDetails>
    </FixedRowHeight>
  ) : (
    <FixedRowHeight>
      {imageURL && (
        <RoundedProfileImage>
          <img src={imageURL} alt="profile" />
        </RoundedProfileImage>
      )}
      <AutoColumn gap="0.5rem">
        <TYPE.mediumHeader>{name}</TYPE.mediumHeader>
        <TYPE.black fontSize={12}>@{handle}</TYPE.black>
      </AutoColumn>
    </FixedRowHeight>
  )
}
