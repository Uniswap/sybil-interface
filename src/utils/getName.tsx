import React, { ReactNode } from 'react'
import { shortenAddress, isAddress } from '.'
import { Identity } from '../state/social/reducer'
import LogoText from '../components/governance/LogoText'

export function nameOrAddress(
  address: string | undefined,
  identities: { [address: string]: Identity } | undefined,
  shortern?: boolean | undefined,
  autonomous?: boolean | undefined,
  ens?: string | null
): string | ReactNode {
  const formattedAddress = isAddress(address)

  if (!address) {
    return ''
  }

  // checksum name, as they are checksummed in identity mapping
  const identity: Identity | undefined = formattedAddress ? identities?.[formattedAddress] : undefined

  if (identity?.twitter) {
    return <LogoText type="twitter">{'@' + identity.twitter.handle}</LogoText>
  }

  if (identity?.other) {
    return <LogoText type="other">{identity.other.name}</LogoText>
  }

  if (autonomous) {
    return 'Autonomous Proposal Contract ⚙️'
  }

  if (shortern) {
    return ens ?? shortenAddress(address)
  }

  return ens ?? address
}
