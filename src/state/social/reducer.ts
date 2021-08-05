import { updateIdentities } from './actions'
import { createReducer } from '@reduxjs/toolkit'

export interface TwitterEntry {
  handle: string | undefined
  timestamp: number
}

export interface UncategorizedContentEntry {
  name: string
  contentURL: string
}

export interface Identity {
  twitter: TwitterEntry | undefined
  other: UncategorizedContentEntry | undefined
}

export interface Identities {
  [address: string]: Identity
}

export interface SocialState {
  // all identities fetched
  identities: Identities | undefined
}

export const initialState: SocialState = {
  identities: undefined,
}

export default createReducer(initialState, (builder) =>
  builder.addCase(updateIdentities, (state, action) => {
    state.identities = action.payload.identities
  })
)
