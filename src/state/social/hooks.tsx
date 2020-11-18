import { useState, useEffect, useCallback } from 'react'
import { isAddress, calculateGasMargin } from '../../utils'
import { useSybilContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { client as sybilClient } from '../../apollo/client'
import { CONTENT_SUBSCRIPTION } from '../../apollo/queries'
import { useSubscription } from 'react-apollo'
import { verifyHandleForAddress, fetchProfileData, ProfileDataResponse } from '../../data/social'

interface TwitterProfileData {
  name: string
  handle: string
  profileURL: string
}

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
                username
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

interface AttestationResponse {
  subscriptionData: {
    data?: {
      attestations: Attestation[]
    }
  }
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

// fetch any on chain mappings from address -> social content (not gauranteed verified)
export function useSubgraphEntries(address: string | undefined | null): Attestation[] | undefined {
  const [entries, setEntries] = useState<Attestation[]>()

  try {
    useSubscription(CONTENT_SUBSCRIPTION, {
      client: sybilClient,
      variables: {
        account: address?.toLocaleLowerCase()
      },
      onSubscriptionData: (res: AttestationResponse) => {
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

export function useVerifiedHandles(account: string | null | undefined): HandleEntry[] | undefined {
  // fetch list of attested handles for this account
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
