import { GovernanceInfo } from './reducer'
import { createAction } from '@reduxjs/toolkit'

export const updateActiveProtocol = createAction<{ activeProtocol: GovernanceInfo }>('/governance/updateActiveProtocol')
export const updateFilterActive = createAction<{ filterActive: boolean }>('/governance/updateFilterActive')
