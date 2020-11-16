import { ChainId, JSBI, BigintIsh } from '@uniswap/sdk'
import { updateActiveProtocol } from './actions'
import { createReducer } from '@reduxjs/toolkit'
import UniLogo from '../../assets/images/unilogo.svg'
import CompLogo from '../../assets/images/compLogo.png'

export interface GovernanceInfo {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  token: {
    address: { [chainId in ChainId]: string }
    name: string
    symbol: string
    decimals: number
    totalSupply: BigintIsh
  }
  governanceAddress: { [chainId in ChainId]: string }
  subgraphClientURL: string
}

// constant addresses for supported protocols
export const UNI_GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
export const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'

export const COMP_GOVERNANCE_ADDRESS = '0xc0dA01a04C3f3E0be433606045bB7017A7323E38'
export const COMP_ADDRESS = '0xc00e94cb662c3520282e6f5717214004a7f26888'

export const UNISWAP_GOVERNANCE: GovernanceInfo = {
  id: 'uniswap',
  name: 'Uniswap Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5',
  token: {
    address: {
      [ChainId.MAINNET]: UNI_ADDRESS,
      [ChainId.RINKEBY]: UNI_ADDRESS,
      [ChainId.ROPSTEN]: UNI_ADDRESS,
      [ChainId.GÖRLI]: UNI_ADDRESS,
      [ChainId.KOVAN]: UNI_ADDRESS
    },
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
    totalSupply: JSBI.BigInt(1000000000 * 1e18) // used for % calculation
  },
  governanceAddress: {
    [ChainId.MAINNET]: UNI_GOVERNANCE_ADDRESS,
    [ChainId.RINKEBY]: UNI_GOVERNANCE_ADDRESS,
    [ChainId.ROPSTEN]: UNI_GOVERNANCE_ADDRESS,
    [ChainId.GÖRLI]: UNI_GOVERNANCE_ADDRESS,
    [ChainId.KOVAN]: UNI_GOVERNANCE_ADDRESS
  },
  subgraphClientURL: 'https://api.thegraph.com/subgraphs/name/ianlapham/governance-tracking'
}

export const COMPOUND_GOVERNANCE: GovernanceInfo = {
  id: 'compound',
  name: 'Compound Governance',
  logo: CompLogo,
  primaryColor: '#00D395',
  secondaryColor: '#f0fffa',
  token: {
    address: {
      [ChainId.MAINNET]: COMP_ADDRESS,
      [ChainId.RINKEBY]: COMP_ADDRESS,
      [ChainId.ROPSTEN]: COMP_ADDRESS,
      [ChainId.GÖRLI]: COMP_ADDRESS,
      [ChainId.KOVAN]: COMP_ADDRESS
    },
    name: 'Compound Governance Token',
    symbol: 'COMP',
    decimals: 18,
    totalSupply: JSBI.BigInt('10000000000000000000000000') // used for % calculation
  },
  governanceAddress: {
    [ChainId.MAINNET]: COMP_GOVERNANCE_ADDRESS,
    [ChainId.RINKEBY]: COMP_GOVERNANCE_ADDRESS,
    [ChainId.ROPSTEN]: COMP_GOVERNANCE_ADDRESS,
    [ChainId.GÖRLI]: COMP_GOVERNANCE_ADDRESS,
    [ChainId.KOVAN]: COMP_GOVERNANCE_ADDRESS
  },
  subgraphClientURL: 'https://api.thegraph.com/subgraphs/name/ianlapham/governance-tracking'
}

// mapping for routing
export const SUPPORTED_PROTOCOLS: { [id: string]: GovernanceInfo } = {
  uniswap: UNISWAP_GOVERNANCE,
  compound: COMPOUND_GOVERNANCE
}

export interface GovernanceState {
  // the selected option from supported protocol options
  activeProtocol: GovernanceInfo | undefined
}

export const initialState: GovernanceState = {
  activeProtocol: undefined
}

export default createReducer(initialState, builder =>
  builder.addCase(updateActiveProtocol, (state, action) => {
    state.activeProtocol = action.payload.activeProtocol
  })
)
