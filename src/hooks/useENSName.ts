import { namehash } from 'ethers/lib/utils'
import { useMemo, useEffect } from 'react'
import { useSingleCallResult } from '../state/multicall/hooks'
import { isAddress } from '../utils'
import isZero from '../utils/isZero'
import { useENSRegistrarContract, useENSResolverContract } from './useContract'
import useDebounce from './useDebounce'
import { useActiveWeb3React } from '.'

/**
 * Does a reverse lookup for an address to find its ENS name.
 * Note this is not the same as looking up an ENS name to find an address.
 */
export default function useENSName(address?: string): { ENSName: string | null; loading: boolean } {
  const debouncedAddress = useDebounce(address, 200)
  const ensNodeArgument = useMemo(() => {
    if (!debouncedAddress || !isAddress(debouncedAddress)) return [undefined]
    try {
      return debouncedAddress ? [namehash(`${debouncedAddress.toLowerCase().substr(2)}.addr.reverse`)] : [undefined]
    } catch (error) {
      return [undefined]
    }
  }, [debouncedAddress])
  const registrarContract = useENSRegistrarContract(false)
  const resolverAddress = useSingleCallResult(registrarContract, 'resolver', ensNodeArgument)
  const resolverAddressResult = resolverAddress.result?.[0]
  const resolverContract = useENSResolverContract(
    resolverAddressResult && !isZero(resolverAddressResult) ? resolverAddressResult : undefined,
    false
  )
  const name = useSingleCallResult(resolverContract, 'name', ensNodeArgument)

  const changed = debouncedAddress !== address
  return {
    ENSName: changed ? null : name.result?.[0] ?? null,
    loading: changed || resolverAddress.loading || name.loading,
  }
}

export function useBulkENS(addresses: string[]): { names: string[] | null; loading: boolean } {
  const { library } = useActiveWeb3React()

  useEffect(() => {
    async function fetchAllAddresses() {
      const answers = await Promise.all(
        addresses.map((a) => {
          return library?.lookupAddress(a)
        })
      )
      const amountHave = answers.reduce((accum, name) => {
        if (name) {
          return (accum = accum + 1)
        }
        return accum
      }, 0)

      console.log('amount have: ' + amountHave + ' / ' + answers.length)
    }
    fetchAllAddresses()
  }, [addresses, library])

  return {
    names: [''],
    loading: false,
  }
}
