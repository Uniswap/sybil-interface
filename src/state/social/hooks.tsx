import { useState, useEffect, useCallback } from 'react'
import { fetchProfileData, ProfileDataResponse, fetchLatestTweet, LatestTweetResponse } from '../../data/social'
import { useActiveWeb3React } from '../../hooks'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '..'
import { updateVerifiedHanldes, updateUncategorizedNames } from './actions'

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
  readonly error?: string | undefined
}

export interface HandleEntry {
  handle: string | undefined
  timestamp: number
}

export interface UncategorizedContentEntry {
  name: string
  contentURL: string
}

// get al verified handles from github file
export function useAllVerifiedHandles(): [
  { [address: string]: HandleEntry } | undefined,
  (verifiedHandles: { [address: string]: HandleEntry }) => void
] {
  const dispatch = useDispatch<AppDispatch>()
  const verifiedHandles = useSelector<AppState, AppState['social']['verifiedHandles']>(
    state => state.social.verifiedHandles
  )

  // set new or reset account
  const setVerifiedHandles = useCallback(
    (verifiedHandles: { [address: string]: HandleEntry }) => {
      dispatch(updateVerifiedHanldes({ verifiedHandles }))
    },
    [dispatch]
  )

  return [verifiedHandles, setVerifiedHandles]
}

// check if address is contained within list of all verified handles
// undefined is no verification, null is loading
export function useVerifiedHandle(address: string | null | undefined): HandleEntry | undefined | null {
  const [handles] = useAllVerifiedHandles()
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

  const verifyCallback = useCallback(() => {
    if (!tweetID)
      return Promise.reject({
        success: false,
        error: 'Invalid tweet id'
      })

    return fetch(`${VERIFICATION_WORKER_URL}/api/verify?account=${account}&id=${tweetID}`)
      .then(async res => {
        if (res.status === 200) {
          return {
            success: true
          }
        } else {
          console.log('here')
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
      .catch(() => {
        return {
          success: false,
          error: 'Error submitting verification'
        }
      })
  }, [account, tweetID])

  return { verifyCallback }
}

// check for tweet every couple seconds after theyve kicked off flow
const POLL_DURATION_MS = 8000 // length after which to check
export function useTweetWatcher(
  tweetCopy: string, // used to check regex
  twitterHandle: string | undefined, // handle to fetch tweet from
  watch: boolean, // wether to actively look or not
  setWatch: React.Dispatch<React.SetStateAction<boolean | undefined>>,
  setTweetID: React.Dispatch<React.SetStateAction<string | undefined>>,
  setTweetError: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (twitterHandle && watch) {
        fetchLatestTweet(twitterHandle).then((res: LatestTweetResponse | null) => {
          if (res?.data[0]) {
            const tweetData = res?.data?.[0]
            // check that tweet contains correct data
            const passedRegex = tweetData.text.includes(tweetCopy)
            if (passedRegex) {
              setTweetID(tweetData.id)
              setTweetError(undefined)
              setWatch(false)
            } else {
              setWatch(false)
              setTweetError('Tweet not found, try again with exact message.')
            }
          } else {
            setWatch(false)
            setTweetError('Tweet not found, try again.')
          }
        })
      }
    }, POLL_DURATION_MS)
    return () => clearTimeout(timer)
  }, [setTweetError, setTweetID, setWatch, tweetCopy, twitterHandle, watch])
}

// get al verified handles from github file
export function useAllUncategorizedNames(): [
  { [address: string]: UncategorizedContentEntry } | undefined,
  (names: { [address: string]: UncategorizedContentEntry }) => void
] {
  const dispatch = useDispatch<AppDispatch>()
  const names = useSelector<AppState, AppState['social']['uncategorizedNames']>(
    state => state.social.uncategorizedNames
  )

  // set new or reset account
  const setNames = useCallback(
    (names: { [address: string]: UncategorizedContentEntry }) => {
      dispatch(updateUncategorizedNames({ names }))
    },
    [dispatch]
  )

  return [names, setNames]
}
