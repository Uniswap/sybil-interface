import React from 'react'
import styled, { keyframes } from 'styled-components'
import Row from '../Row'

const Card = styled.div`
  width: 100%;
  padding: 0 2rem;
`

const shimmer = keyframes`
    0% {
        background-position: -1000px 0;
    }
    100% {
        background-position: 1000px 0;
    }
`

const Shimmer = styled.div`
  animation: ${shimmer} 3s infinite;
  background: linear-gradient(to right, #eff1f3 4%, #e2e2e2 25%, #eff1f3 36%);
  background-size: 1000px 100%;
`

const Circle = styled(Shimmer)`
  height: 40px;
  width: 40px;
  margin-right: 10px;
  border-radius: 50%;
`

const BlankRow = styled(Shimmer)`
  height: 40px;
  border-radius: 12px;
  width: 60%;
`

export default function CardLoader() {
  return (
    <Card>
      <Row align="center" justify="space-between">
        <Circle />
        <BlankRow />
      </Row>
    </Card>
  )
}
