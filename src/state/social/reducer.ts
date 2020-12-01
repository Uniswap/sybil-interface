import { updateVerifiedHanldes } from './actions'
import { HandleEntry } from './hooks'
import { createReducer } from '@reduxjs/toolkit'
export interface SocialState {
  // the selected option from supported protocol options
  verifiedHandles: { [address: string]: HandleEntry } | undefined
}

export const initialState: SocialState = {
  verifiedHandles: undefined
}

export default createReducer(initialState, builder =>
  builder.addCase(updateVerifiedHanldes, (state, action) => {
    state.verifiedHandles = action.payload.verifiedHandles
  })
)
