import { HandleEntry, UncategorizedContentEntry } from './hooks'
import { createAction } from '@reduxjs/toolkit'

export const updateVerifiedHanldes = createAction<{ verifiedHandles: { [address: string]: HandleEntry } }>(
  '/social/updateVerifiedHanldes'
)
export const updateUncategorizedNames = createAction<{ names: { [address: string]: UncategorizedContentEntry } }>(
  '/social/updateUncategorizedNames'
)
