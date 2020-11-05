import { GovernanceInfo } from './reducer'
import { createAction } from '@reduxjs/toolkit'

export const updateActiveProtocol = createAction<{ activeProtocol: GovernanceInfo }>('/governance/updateActiveProtocol')
