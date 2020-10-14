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

const FadedDetails = styled(AutoColumn)`
  opacity: 0.4;
`

export default function EmptyAccount() {
  return (
    <Row>
      <EmptyCircle />
      <FadedDetails gap="0.5rem">
        <TYPE.mediumHeader>Account</TYPE.mediumHeader>
        <TYPE.black fontSize={12}>Linked accounts will appear here</TYPE.black>
      </FadedDetails>
    </Row>
  )
}
