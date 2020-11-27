import { useState, useEffect } from 'react'
import { fetchProfileData, ProfileDataResponse, fetchAllVerifiedHandles } from '../../data/social'
import { useActiveWeb3React } from '../../hooks'

const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'

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

export interface HandleEntry {
  handle: string | undefined
  timestamp: number
}

export function validVerification(value: HandleEntry): value is HandleEntry {
  return value !== null && value !== undefined && value.handle !== undefined
}

// get entire list of verified handles
export function useAllVerifiedHandles(): { [address: string]: HandleEntry } | undefined {
  const [handles, setHandles] = useState<{ [address: string]: HandleEntry }>()
  useEffect(() => {
    async function fetchData() {
      const results: { [address: string]: HandleEntry } | undefined = await fetchAllVerifiedHandles()
      setHandles(results)
    }
    if (!handles) {
      fetchData()
    }
  }, [handles])
  return handles
}

// for an ethereum address, fetch a verified handle
// undefined is no verification, null is loading
export function useVerifiedHandle(address: string | null | undefined): HandleEntry | undefined | null {
  const handles = useAllVerifiedHandles()
  if (!handles) {
    return null
  }
  if (!address) {
    return undefined
  }
  return handles[address]
}

// verify a new adress -> handle mapping
// returns success if properly inserted into gist and account in tweet matches signed in account
export function useVerifyCallback(tweetID: string | undefined): { verifyCallback: () => Promise<VerifyResult> } {
  const { account } = useActiveWeb3React()

  const verifyCallback = async () => {
    if (!tweetID)
      return {
        success: false,
        error: 'Invalid tweet id'
      }

    return fetch(`${VERIFICATION_WORKER_URL}/api/verify?account=${account}&id=${tweetID}`).then(async res => {
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
  }

  return { verifyCallback }
}
