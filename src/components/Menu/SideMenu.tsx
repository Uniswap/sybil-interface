import React, { useState } from 'react'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { AutoColumn } from '../Column'

const Wrapper = styled.div<{ open: boolean }>`
  height: 100vh;
  width: ${({ open }) => (open ? '280px' : '40px')};
  background-color: #f7f8fa;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  :hover {
    cursor: ${({ open }) => !open && 'pointer'};
  }
`

export default function SideMenu() {
  const [open, setOpen] = useState(true)

  return (
    // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451
    <Wrapper open={open} onClick={() => !open && setOpen(true)}>
      {open && (
        <RowBetween>
          <TYPE.mediumHeader>Sybill</TYPE.mediumHeader>
          <CloseIcon onClick={() => setOpen(false)} />
        </RowBetween>
      )}
      {open && (
        <AutoColumn gap="1rem">
          <TYPE.largeHeader>Attestations for Ethereum Governance</TYPE.largeHeader>
          <TYPE.body>
            This tool connects a wallet address to a digital identity by singing a message on chain.This mapping of
            address to identity can be updated, removed and queried on chain using any ethereum indexer.This mapping can
            be used for displaying public identies for governance platforms on ethereum.
          </TYPE.body>
          <TYPE.body>A Uniswap project</TYPE.body>
        </AutoColumn>
      )}
    </Wrapper>
  )
}
