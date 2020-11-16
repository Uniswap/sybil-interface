import { useState, useEffect, useCallback } from 'react'
import { isAddress, calculateGasMargin } from '../../utils'
import { useSybilContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../transactions/hooks'
import { useActiveWeb3React } from '../../hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { client as sybilClient } from '../../apollo/client'
import { CONTENT_SUBSCRIPTION } from '../../apollo/queries'
import { useSubscription } from 'react-apollo'

const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'
const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'

// @todo add typed query response

export interface HandleResponse {
  data: [
    {
      handle: string
    }
  ]
}

export async function fetchSingleVerifiedHandle(address: string): Promise<string | undefined> {
  if (!isAddress(address)) return Promise.reject(new Error('Invalid address'))

  return fetch(`${VERIFICATION_WORKER_URL}/api/accounts?address=${address}`).then(async res => {
    if (res.status === 200) {
      return res.json().then(data => data.handle)
    }
    return Promise.reject(new Error('Invalid response'))
  })
}

// for an ethereum address, fetch a verified handle if it exists
// undefined means no verification yet
export function useVerifiedHandle(address: string | null | undefined): string | undefined {
  const [handle, setHandle] = useState<string | undefined>()

  useEffect(() => {
    if (!address) {
      setHandle(undefined)
    } else {
      fetchSingleVerifiedHandle(address).then(handle => {
        setHandle(handle)
      })
    }
  }, [address])
  return handle
}

export interface LatestTweetResponse {
  data: [
    {
      id: string
      text: string
    }
  ]
}

// dont save responses as user may need to tweet multiple times
export async function fetchLatestTweet(handle: string): Promise<LatestTweetResponse | null> {
  const url = `${TWITTER_WORKER_URL}/user/latest-tweet?handle=` + handle
  return fetch(url)
    .then(async res => {
      if (res.status === 200) {
        return res.json()
      } else {
        return null
      }
    })
    .catch(error => {
      console.error('Failed to get claim data', error)
    })
}

interface ProfileDataResponse {
  data: {
    id: number
    name: string
    username: string
    profile_image_url: string
  }
}
const PROFILE_DATA_PROMISES: { [key: string]: Promise<ProfileDataResponse | null> } = {}

function fetchProfileData(handle: string): Promise<ProfileDataResponse | null> {
  const key = `${handle}`
  const url = `${TWITTER_WORKER_URL}/user?handle=${handle}`
  return (PROFILE_DATA_PROMISES[key] =
    PROFILE_DATA_PROMISES[key] ??
    fetch(url)
      .then(async res => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.debug(`No handle found`)
          return null
        }
      })
      .catch(error => {
        console.error('Failed to get claim data', error)
      }))
}

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

const VERIFY_PROMISES: { [key: string]: Promise<VerifyResult> } = {}

export function useVerifyCallback(tweetID: string | undefined): { verifyCallback: () => Promise<VerifyResult> } {
  const verifyCallback = useCallback(() => {
    if (!tweetID) return Promise.reject(new Error('Invalid address'))
    const key = tweetID

    const url = `${VERIFICATION_WORKER_URL}/api/verify?id=${tweetID}`

    return (VERIFY_PROMISES[key] =
      VERIFY_PROMISES[key] ??
      fetch(url)
        .then(async res => {
          if (res.status === 200) {
            return {
              success: true
            }
          } else {
            const errorText = await res.text()
            if (res.status === 400 && errorText === 'Invalid tweet format.') {
              return {
                success: false,
                error: 'Invalid tweet format'
              }
            }
            if (res.status === 400 && errorText === 'Invalid tweet id.') {
              return {
                success: false,
                error: 'Invalid tweet id'
              }
            }
            return {
              success: false,
              error: 'Unknown error, please try again.'
            }
          }
        })
        .catch(error => {
          console.error('Failed to get claim data', error)
        }))
  }, [tweetID])

  return { verifyCallback }
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
}

interface AttestationResponse {
  data: {
    attestations: Attestation[]
  }
}

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

// fetch any on chain mappings from address -> social content (not gauranteed verified)
export function useSubgraphEntries(address: string | undefined | null): Attestation[] | undefined {
  const [entries, setEntries] = useState<Attestation[]>()
  useSubscription(CONTENT_SUBSCRIPTION, {
    client: sybilClient,
    variables: {
      account: address?.toLocaleLowerCase()
    },
    onSubscriptionData: (res: any) => {
      setEntries(res?.subscriptionData?.data?.attestations)
    }
  })

  return entries ? entries.filter(notEmpty) : undefined
}

export function useVerifiedHandles(account: string | null | undefined): string[] | undefined {
  // fetch list of attested handles for this account
  const entries = useSubgraphEntries(account)

  // list of verified handles for account based on subgraph list
  const [handles, setHandles] = useState<(string | undefined)[]>()

  // if new entries, refetch handles
  useEffect(() => {
    console.log('New subgraph entry')
    setHandles(undefined)
  }, [entries?.length])

  useEffect(() => {
    async function fetchHandles() {
      const handles =
        entries &&
        (await Promise.all(
          entries?.map(async entry => {
            console.log('fetching')
            try {
              return fetch(`${VERIFICATION_WORKER_URL}/api/verify?account=${entry.account}&id=${entry.tweetID}`).then(
                async res => {
                  if (res.status === 200) {
                    const handle = await res.text()
                    return handle
                  }
                  return undefined
                }
              )
            } catch {
              return Promise.reject(new Error('Invalid response'))
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
