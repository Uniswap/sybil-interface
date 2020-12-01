import { HandleEntry } from './hooks'
import { createAction } from '@reduxjs/toolkit'

export const updateVerifiedHanldes = createAction<{ verifiedHandles: { [address: string]: HandleEntry } }>(
  '/social/updateVerifiedHanldes'
)
