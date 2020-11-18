import { useState, useEffect, useCallback } from 'react'
import { isAddress, calculateGasMargin, notEmpty } from '../../utils'
import { useSybilContract } from '../../hooks/useContract'
import { useTransactionAdder, useVerifcationConfirmed } from '../transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { client as sybilClient } from '../../apollo/client'
import { CONTENT_SUBSCRIPTION, ATTESTATIONS_QUERY } from '../../apollo/queries'
import { useSubscription } from 'react-apollo'
import { verifyHandleForAddress, fetchProfileData, ProfileDataResponse } from '../../data/social'

interface TwitterProfileData {
  name: string
  handle: string
  profileURL: string
}
// get handle and profile image from twitter
export function useTwitterProfileData(handle: string | undefined | null): TwitterProfileData | undefined {
  const [formattedData, setFormattedData] = useState<TwitterProfileData | undefined>()

  useEffect(() => {
    if (!handle) {
      setFormattedData(undefined)
    } else {
      fetchProfileData(handle).then((profileData: ProfileDataResponse | null) => {
        if (profileData?.data) {
          setFormattedData({
            name: profileData.data.name,
            handle: profileData.data.username,
            profileURL: profileData.data.profile_image_url
          })
        }
      })
    }
  }, [handle])

  return formattedData
}

// monitor if the tweet was correctly picked up and linked in cloudflare KV
export interface VerifyResult {
  readonly success: boolean
  readonly error?: string
}

// Send transaction on chain to add address -> content mapping
export function useAttestCallBack(
  username: string | undefined
): (account: string | undefined, contentURL: string) => undefined | Promise<string> {
  const { chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const sybilContract = useSybilContract()

  return useCallback(
    (account: string | undefined, contentURL: string) => {
      if (!library || !chainId || !account || !isAddress(account ?? '') || !username) return undefined

      const args = [account, contentURL]

      if (!sybilContract) throw new Error('No UNI Contract!')
      return sybilContract.estimateGas.verifyContent(...args, {}).then(estimatedGasLimit => {
        return sybilContract
          .verifyContent(...args, { value: null, gasLimit: calculateGasMargin(estimatedGasLimit) })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Verifying @${username}`,
              social: {
                username,
                account
              }
            })
            return response.hash
          })
      })
    },
    [addTransaction, chainId, library, sybilContract, username]
  )
}

interface Attestation {
  id: string
  account: string
  tweetID: string
  timestamp: number
}

interface AttestationQueryResponse {
  data?: {
    attestations: Attestation[]
  }
}

interface AttestationSubscriptionResponse {
  subscriptionData: {
    data?: {
      attestations: Attestation[]
    }
  }
}

// fetch any on chain mappings from address -> social content (not gauranteed verified)
export function useSubgraphEntries(address: string | undefined | null): Attestation[] | undefined {
  const [entries, setEntries] = useState<Attestation[]>()

  const newConfirmation = useVerifcationConfirmed()

  // backup to fetch new entries on confirmation change if socket stalls
  useEffect(() => {
    if (newConfirmation) {
      try {
        sybilClient
          .query({
            query: ATTESTATIONS_QUERY,
            variables: {
              account: address?.toLocaleLowerCase()
            }
          })
          .then((res: AttestationQueryResponse) => {
            if (res.data) {
              setEntries(res.data.attestations)
            }
          })
      } catch (e) {
        console.log(e)
      }
    }
  }, [address, newConfirmation])

  try {
    useSubscription(CONTENT_SUBSCRIPTION, {
      client: sybilClient,
      variables: {
        account: address?.toLocaleLowerCase()
      },
      onSubscriptionData: (res: AttestationSubscriptionResponse) => {
        setEntries(res?.subscriptionData?.data?.attestations)
      }
    })
  } catch (e) {
    console.log(e)
  }

  return entries ? entries.filter(notEmpty) : undefined
}

interface HandleEntry {
  handle: string | undefined
  timestamp: number
}

// use verification service to return all verified handles for an account
export function useVerifiedHandles(account: string | null | undefined): HandleEntry[] | undefined {
  // fetch list of attested handles for this account from subgraph
  const entries = useSubgraphEntries(account)
  const entryAmount = entries?.length // used to detect changes in subgraph

  // list of verified handles for account based on subgraph list
  const [handles, setHandles] = useState<(HandleEntry | undefined)[]>()

  // if new entries, refetch handles
  useEffect(() => {
    console.log('New subgraph entry')
    setHandles(undefined)
  }, [entryAmount])

  useEffect(() => {
    async function fetchHandles() {
      const handles =
        entries &&
        (await Promise.all(
          entries?.map(async entry => {
            const handle = await verifyHandleForAddress(entry.account, entry.tweetID)
            return {
              handle,
              timestamp: entry.timestamp
            }
          })
        ))
      setHandles(handles)
    }
    if (!handles) {
      fetchHandles()
    }
  }, [entries, handles])

  return handles ? handles.filter(notEmpty) : undefined
}
