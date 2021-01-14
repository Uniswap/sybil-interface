import React, { ReactNode } from 'react'
import { isAddress, shortenAddress } from '.'
import { Identity } from '../state/social/reducer'
import LogoText from '../components/governance/LogoText'

export function nameOrAddress(
  address: string | undefined,
  identities: { [address: string]: Identity } | undefined,
  shortern?: boolean | undefined
): string | ReactNode {
  const formattedAddress = isAddress(address)

  if (!formattedAddress) {
    return address
  }

  const identity: Identity | undefined = identities?.[formattedAddress]

  if (identity?.twitter) {
    return <LogoText type="twitter">{'@' + identity.twitter.handle}</LogoText>
  }

  if (identity?.other) {
    return identity.other.name
  }

  if (shortern) {
    return shortenAddress(formattedAddress)
  }

  return address
}
