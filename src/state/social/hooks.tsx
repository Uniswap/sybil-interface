import { useState, useEffect } from 'react'
import { isAddress } from '../../utils'

const TWITTER_WORKER_URL = 'https://twitter-worker.uniswap.workers.dev'
const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'

// @todo add typed query response
export function useVerifiedHandles(addresses: (string | null | undefined)[]): string[] {
  const [handles, setHandles] = useState<string[]>([])
  useEffect(() => {
    async function fetchData() {
      if (addresses) {
        const results = await Promise.all(
          addresses
            .filter(a => !!isAddress(a)) // filter out invalid addresses
            .map(async a => {
              return fetch(`${VERIFICATION_WORKER_URL}/api/accounts?address=${a}`).then(res => {
                if (res.status === 200) {
                  return res.json().then(data => data.handle)
                }
                return undefined
              })
            })
        )
        setHandles(results)
      }
    }
    fetchData()
  }, [addresses])

  return handles
}

// for an ethereum address, fetch a verified handle
export function useVerifiedHandle(address: string | null | undefined): string | undefined {
  const handles = useVerifiedHandles([address])
  return handles[0]
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

export function fetchLatestTweet(handle: string): Promise<LatestTweetResponse | null> {
  const key = `${handle}`
  const url = `${TWITTER_WORKER_URL}/user/latest-tweet?handle=` + handle

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
  const verifyCallback = () => {
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
  }

  return { verifyCallback }
}
