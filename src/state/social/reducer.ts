import { updateVerifiedHanldes, updateUncategorizedNames } from './actions'
import { HandleEntry, UncategorizedContentEntry } from './hooks'
import { createReducer } from '@reduxjs/toolkit'

export interface SocialState {
  // all verified twitter handles
  verifiedHandles: { [address: string]: HandleEntry } | undefined

  // non twitter entities
  uncategorizedNames: { [address: string]: UncategorizedContentEntry } | undefined
}

export const initialState: SocialState = {
  verifiedHandles: undefined,
  uncategorizedNames: undefined
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateVerifiedHanldes, (state, action) => {
      state.verifiedHandles = action.payload.verifiedHandles
    })
    .addCase(updateUncategorizedNames, (state, action) => {
      state.uncategorizedNames = action.payload.names
    })
)
