import { createAction } from '@reduxjs/toolkit'

export interface SerializedToken {
  chainId: number
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export const updateMatchesDarkMode = createAction<{ matchesDarkMode: boolean }>('user/updateMatchesDarkMode')
export const updateUserDarkMode = createAction<{ userDarkMode: boolean }>('user/updateUserDarkMode')
export const updateTwitterAccount = createAction<{ twitterAccount: string | undefined }>('user/updateTwitterAccount')
export const updateLastSelectedProtocolID = createAction<{ protocolID: string | undefined }>(
  'user/updateLastSelectedProtocolID'
)
export const toggleURLWarning = createAction<void>('app/toggleURLWarning')
