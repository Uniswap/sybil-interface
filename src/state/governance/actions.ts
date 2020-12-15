import { GovernanceInfo } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { DelegateData } from './hooks'

export const updateActiveProtocol = createAction<{ activeProtocol: GovernanceInfo }>('/governance/updateActiveProtocol')
export const updateFilterActive = createAction<{ filterActive: boolean }>('/governance/updateFilterActive')
export const updateTopDelegates = createAction<{ topDelegates: DelegateData[] | undefined }>(
  `/governance/updateTopDelegates`
)
export const updateVerifiedDelegates = createAction<{ verifiedDelegates: DelegateData[] | undefined }>(
  `/governance/updateVerifiedDelegates`
)
