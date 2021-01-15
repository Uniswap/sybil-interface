import React, { ReactNode } from 'react'
import { shortenAddress } from '.'
import { Identity } from '../state/social/reducer'
import LogoText from '../components/governance/LogoText'

export function nameOrAddress(
  address: string | undefined,
  identities: { [address: string]: Identity } | undefined,
  shortern?: boolean | undefined,
  autonomous?: boolean | undefined
): string | ReactNode {
  if (!address) {
    return ''
  }

  const identity: Identity | undefined = identities?.[address]

  if (identity?.twitter) {
    return <LogoText type="twitter">{'@' + identity.twitter.handle}</LogoText>
  }

  if (identity?.other) {
    return identity.other.name
  }

  if (autonomous) {
    return 'Autonomous Proposal Contract ⚙️'
  }

  if (shortern) {
    return shortenAddress(address)
  }

  return address
}
