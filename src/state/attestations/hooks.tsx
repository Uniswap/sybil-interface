import { useState, useEffect } from 'react'
import { client } from '../../apollo/client'
import { LOOKUP } from '../../apollo/queries'
import { isAddress } from '../../utils'
import { ChainId } from '@uniswap/sdk'
import { useActiveWeb3React } from '../../hooks'

export function useHandleForAddress(address: string | null | undefined): string | undefined {
  const [data, setData] = useState()

  // subgraphs only store ids in lowercase, format
  const formattedAddress = address?.toLocaleLowerCase()
  useEffect(() => {
    async function fetch() {
      const res = await client.query({
        query: LOOKUP,
        variables: {
          user: formattedAddress
        },
        fetchPolicy: 'cache-first'
      })
      if (res) {
        setData(res.data.attestations[0]?.handle)
      }
    }
    if (!data && address) {
      fetch()
    }
  }, [address, data, formattedAddress])

  return data
}

const TWITTER_WORK_URL = 'https://twitter-worker.ianlapham.workers.dev/'

interface TwitterResponse {
  data: {
    id: number
    name: string
    username: string
    profile_image_url: string
  }
}

const TWITTER_PROMISES: { [key: string]: Promise<TwitterResponse | null> } = {}

// returns the claim for the given address, or null if not valid
function fetchTwitterDataFromHandle(
  account: string,
  chainId: ChainId,
  handle: string
): Promise<TwitterResponse | null> {
  const formatted = isAddress(account)
  if (!formatted) return Promise.reject(new Error('Invalid address'))
  const key = `${chainId}:${account}:${handle}`

  const url = `${TWITTER_WORK_URL}/user?handle=${handle}`

  return (TWITTER_PROMISES[key] =
    TWITTER_PROMISES[key] ??
    fetch(url)
      .then(async res => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.debug(`No claim for account ${formatted} on chain ID ${chainId}`)
          return null
        }
      })
      .catch(error => {
        console.error('Failed to get claim data', error)
      }))
}

interface UserTwitterData {
  name: string
  handle: string
  profileURL: string
}

// check for verified handle on subgraph, if handle, fetch all relevant twitter profile data
// null means no verified handle attestation found
export function useTwitterDataForHandle(handle: string | null | undefined): UserTwitterData | null | undefined {
  const { chainId, account } = useActiveWeb3React()

  const key = `${chainId}:${account}:${handle}`
  const [formattedData, setFormattedData] = useState<{ [key: string]: UserTwitterData | null }>({})

  useEffect(() => {
    if (!account || !chainId || !handle) return
    fetchTwitterDataFromHandle(account, chainId, handle).then((fetchedData: TwitterResponse | null) => {
      setFormattedData(formattedData => {
        if (fetchedData?.data) {
          return {
            ...formattedData,
            [key]: {
              name: fetchedData.data.name,
              handle: fetchedData.data.username,
              profileURL: fetchedData.data.profile_image_url
            }
          }
        } else {
          return { ...formattedData }
        }
      })
    })
  }, [account, chainId, handle, key])

  return account && chainId ? formattedData[key] : undefined
}

export interface LatestTweetResponse {
  data: [
    {
      id: string
      text: string
    }
  ]
}

// returns the claim for the given address, or null if not valid
const LATEST_TWEET_PROMISES: { [key: string]: Promise<LatestTweetResponse | null> } = {}

export function fetchLatestTweetByHandle(handle: string): Promise<LatestTweetResponse | null> {
  const key = `${handle}`

  const url = `${TWITTER_WORK_URL}/user/latest-tweet?handle=` + handle

  return (LATEST_TWEET_PROMISES[key] =
    LATEST_TWEET_PROMISES[key] ??
    fetch(url)
      .then(async res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return null
        }
      })
      .catch(error => {
        console.error('Failed to get claim data', error)
      }))
}

export function useTwitterDataForAccount(account: string | undefined | null): UserTwitterData | null | undefined {
  const handle = useHandleForAddress(account)
  const userData = useTwitterDataForHandle(handle)
  return userData
}
