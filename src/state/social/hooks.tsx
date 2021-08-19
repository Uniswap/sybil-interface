import React, { useState, useEffect, useCallback } from 'react'
import { fetchProfileData, ProfileDataResponse, fetchLatestTweet, LatestTweetResponse } from '../../data/social'
import { useActiveWeb3React } from '../../hooks'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '..'
import { updateIdentities } from './actions'
import { TwitterEntry, Identities, Identity } from './reducer'
import { isAddress } from '../../utils'

const VERIFICATION_WORKER_URL = 'https://sybil-verifier.uniswap.workers.dev'

// get all identity info from github file
export function useAllIdentities(): [Identities | undefined, (identities: Identities) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const identities = useSelector<AppState, AppState['social']['identities']>((state) => state.social.identities)
  // set new or reset account
  const setIdentities = useCallback(
    (identities: Identities) => {
      dispatch(updateIdentities({ identities }))
    },
    [dispatch]
  )
  return [identities, setIdentities]
}

// filter for only entities with uncategorized names
export function useAllVerifiedHandles(): { [address: string]: TwitterEntry | undefined } | undefined {
  const [allIdentities] = useAllIdentities()
  if (allIdentities) {
    const twitterOnly: { [address: string]: TwitterEntry | undefined } | undefined = {}
    Object.keys(allIdentities).map((address) => {
      if (allIdentities[address].twitter !== undefined) {
        twitterOnly[address] = allIdentities[address].twitter
      }
      return true
    })
    return twitterOnly
  } else {
    return undefined
  }
}

// filter for only entities with twitter handles
// undefined is no verification, null is loading
export function useVerifiedHandle(address: string | null | undefined): TwitterEntry | undefined | null {
  const allHandles = useAllVerifiedHandles()
  const formattedAddress = address && isAddress(address)
  if (!allHandles) {
    return null
  }
  if (!formattedAddress) {
    return undefined
  }
  return allHandles[formattedAddress]
}

// check for any indentity info
// undefined is no verification, null is loading
export function useIdentity(address: string | null | undefined): Identity | undefined | null {
  const [allIdentities] = useAllIdentities()

  const formattedAddress = address && isAddress(address)
  if (!allIdentities) {
    return null
  }
  if (!formattedAddress) {
    return undefined
  }
  return allIdentities[formattedAddress]
}

// monitor status of submission
export interface VerifyResult {
  readonly success: boolean
  readonly error?: string | undefined
}

// verify a new adress -> handle mapping
// returns success if properly inserted into gist and account in tweet matches signed in account
export function useVerifyCallback(tweetID: string | undefined): { verifyCallback: () => Promise<VerifyResult> } {
  const { account } = useActiveWeb3React()

  const verifyCallback = useCallback(() => {
    if (!tweetID)
      return Promise.reject({
        success: false,
        error: 'Invalid tweet id',
      })

    return fetch(`${VERIFICATION_WORKER_URL}/api/verify?account=${account}&id=${tweetID}`)
      .then(async (res) => {
        if (res.status === 200) {
          return {
            success: true,
          }
        } else {
          const errorText = await res.text()
          if (res.status === 400 && errorText === 'Invalid tweet format.') {
            return {
              success: false,
              error: 'Invalid tweet format',
            }
          }
          if (res.status === 400 && errorText === 'Invalid tweet id.') {
            return {
              success: false,
              error: 'Invalid tweet id',
            }
          }
          return {
            success: false,
            error: 'Unknown error, please try again.',
          }
        }
      })
      .catch(() => {
        return {
          success: false,
          error: 'Error submitting verification',
        }
      })
  }, [account, tweetID])

  return { verifyCallback }
}

interface TwitterProfileData {
  name: string
  handle: string
  profileURL: string
}
// get handle and profile image from twitter
export function useTwitterProfileData(handle: string | undefined | null): TwitterProfileData | undefined {
  const [formattedData, setFormattedData] = useState<TwitterProfileData | undefined>()
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!handle) {
      setFormattedData(undefined)
    } else if (!error) {
      fetchProfileData(handle)
        .then((profileData: ProfileDataResponse | null) => {
          if (profileData?.data) {
            setFormattedData({
              name: profileData.data.name,
              handle: profileData.data.username,
              profileURL: profileData.data.profile_image_url,
            })
          }
        })
        .catch(() => {
          console.log('Error fetching profile data for user')
          setError(true)
        })
    }
  }, [handle, error])

  return formattedData
}

export function useMultipleTwitterProfileDatas(
  handles: (string | undefined)[]
): { [handle: string]: TwitterProfileData | undefined } | undefined {
  const [formattedData, setFormattedData] = useState<{ [handle: string]: TwitterProfileData | undefined }>()

  const length = handles.length
  useEffect(() => {
    setFormattedData(undefined)
  }, [length])

  useEffect(() => {
    async function fetchData() {
      // for each handle attestation - verify which ones are legit,
      Promise.all(
        handles.map(async (handle: string | undefined) => {
          if (handle) {
            return fetchProfileData(handle)
              .then((profileData) => {
                return {
                  account: '',
                  handle,
                  profileURL: profileData?.data?.profile_image_url,
                }
              })
              .catch(() => undefined)
          } else {
            return undefined
          }
        })
      )
        .then((handlesData) => {
          setFormattedData(Object.assign({}, ...handlesData.map((key) => key && { [key.handle]: key })))
        })
        .catch(() => undefined)
    }

    // only fetch if valid list of handles
    if (!formattedData) {
      fetchData()
    }
  }, [handles, formattedData])

  return formattedData
}

// check for tweet every couple seconds after theyve kicked off flow
const POLL_DURATION_MS = 8000 // length after which to check
export function useTweetWatcher(
  sig: string | undefined, // used to check regex
  twitterHandle: string | undefined, // handle to fetch tweet from
  watch: boolean, // wether to actively look or not
  setWatch: React.Dispatch<React.SetStateAction<boolean>>,
  setTweetID: React.Dispatch<React.SetStateAction<string | undefined>>,
  setTweetError: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (twitterHandle && watch) {
        fetchLatestTweet(twitterHandle)
          .then((res: LatestTweetResponse | null) => {
            if (res?.data[0]) {
              const tweetData = res?.data?.[0]
              // check that tweet contains correct data
              const passedRegex = sig && tweetData.text.includes('sig:' + sig)
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
          .catch(() => {
            setWatch(false)
            setTweetError('Tweet not found, try again.')
          })
      }
    }, POLL_DURATION_MS)
    return () => clearTimeout(timer)
  }, [setTweetError, setTweetID, setWatch, sig, twitterHandle, watch])
}
