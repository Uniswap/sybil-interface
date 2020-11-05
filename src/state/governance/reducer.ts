import { updateActiveProtocol } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import UniLogo from '../../assets/images/unilogo.svg'

const UNISWAP_GOVERNANCE: GovernanceInfo = {
  name: 'Uniswap Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5'
}

const COMPOUND_GOVERNANCE: GovernanceInfo = {
  name: 'Compound Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5'
}

export const SUPPORTED_PROTOCOLS: { [id: string]: GovernanceInfo } = {
  uniswap: UNISWAP_GOVERNANCE,
  compound: COMPOUND_GOVERNANCE
}

export interface GovernanceInfo {
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
}

export interface GovernanceState {
  // the selected option from supported protocol options
  activeProtocol: GovernanceInfo
}

export const initialState: GovernanceState = {
  activeProtocol: UNISWAP_GOVERNANCE
}

export default createReducer(initialState, builder =>
  builder.addCase(updateActiveProtocol, (state, action) => {
    state.activeProtocol = action.payload.activeProtocol
  })
)
