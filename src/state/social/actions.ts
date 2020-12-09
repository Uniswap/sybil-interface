import { Identities } from './reducer'
import { createAction } from '@reduxjs/toolkit'

export const updateIdentities = createAction<{ identities: Identities }>('/social/updateIdentities')
