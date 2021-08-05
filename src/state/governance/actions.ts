import { GovernanceInfo, GlobaData } from './reducer'
import { createAction } from '@reduxjs/toolkit'
import { DelegateData } from './hooks'

export const updateActiveProtocol = createAction<{ activeProtocol: GovernanceInfo }>('/governance/updateActiveProtocol')
export const updateFilterActive = createAction<{ filterActive: boolean }>('/governance/updateFilterActive')
export const updateTopDelegates =
  createAction<{ protocolID: string; topDelegates: DelegateData[] | undefined }>(`/governance/updateTopDelegates`)
export const updateVerifiedDelegates = createAction<{
  protocolID: string
  verifiedDelegates: DelegateData[] | undefined
}>(`/governance/updateVerifiedDelegates`)

export const updateGlobalData = createAction<{
  protocolID: string
  data: GlobaData | undefined
}>('/governance/updateGlobalData')

export const updateMaxFetched = createAction<{
  protocolID: string
  maxFetched: number | undefined
}>('/governance/updateMaxFetched')
