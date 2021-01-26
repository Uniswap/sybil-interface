import { DelegateData } from './hooks'
import { SerializedToken } from './../user/actions'
import { ChainId, Token } from '@uniswap/sdk'
import {
  updateActiveProtocol,
  updateFilterActive,
  updateTopDelegates,
  updateVerifiedDelegates,
  updateGlobalData,
  updateMaxFetched
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import UniLogo from '../../assets/images/uni-logo.png'
import CompLogo from '../../assets/images/compLogo.png'
import NdxLogo from '../../assets/images/ndxLogo.png'
import { serializeToken } from '../user/hooks'

export interface GovernanceInfo {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  token: SerializedToken
  governanceAddress: string
  social: string
  emoji?: string
}

// protocol wide data
export interface GlobaData {
  id: string
  totalTokenHolders: number
  totalDelegates: number
  delegatedVotes: number
  delegatedVotesRaw: number
}

// constant addresses for supported protocols
export const UNI_GOVERNANCE_ADDRESS = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
export const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
const UNI = new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap')

export const COMP_GOVERNANCE_ADDRESS = '0xc0dA01a04C3f3E0be433606045bB7017A7323E38'
export const COMP_ADDRESS = '0xc00e94cb662c3520282e6f5717214004a7f26888'
const COMP = new Token(ChainId.MAINNET, COMP_ADDRESS, 18, 'COMP', 'Compound Governance Token')

export const NDX_GOVERNANCE_ADDRESS = '0x95129751769f99CC39824a0793eF4933DD8Bb74B'
export const NDX_ADDRESS = '0x86772b1409b61c639EaAc9Ba0AcfBb6E238e5F83'
const NDX = new Token(ChainId.MAINNET, NDX_ADDRESS, 18, 'NDX', 'Indexed')

export const UNISWAP_GOVERNANCE: GovernanceInfo = {
  id: 'uniswap',
  name: 'Uniswap Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5',
  token: serializeToken(UNI),
  governanceAddress: UNI_GOVERNANCE_ADDRESS,
  social: '@UniswapProtocol',
  emoji: '🦄'
}

export const COMPOUND_GOVERNANCE: GovernanceInfo = {
  id: 'compound',
  name: 'Compound Governance',
  logo: CompLogo,
  primaryColor: '#00D395',
  secondaryColor: '#f0fffa',
  token: serializeToken(COMP),
  governanceAddress: COMP_GOVERNANCE_ADDRESS,
  social: '@compoundfinance',
  emoji: '🏦'
}

export const INDEXED_GOVERNANCE: GovernanceInfo = {
  id: 'indexed',
  name: 'Indexed Governance',
  logo: NdxLogo,
  primaryColor: '#111111',
  secondaryColor: '#f2f2f2',
  token: serializeToken(NDX),
  governanceAddress: NDX_GOVERNANCE_ADDRESS,
  social: '@ndxfi',
  emoji: '🏦'
}

// mapping for routing
export const SUPPORTED_PROTOCOLS: { [id: string]: GovernanceInfo } = {
  uniswap: UNISWAP_GOVERNANCE,
  compound: COMPOUND_GOVERNANCE,
  indexed: INDEXED_GOVERNANCE
}

export const FETCHING_INTERVAL = 50

export interface GovernanceState {
  // the selected option from supported protocol options
  activeProtocol: GovernanceInfo | undefined

  // filter only verified delegates
  filterActive: boolean

  // top delegates based on votes
  topDelegates: {
    [protocolID: string]: DelegateData[] | undefined
  }

  // used for paginated delegate lookup
  maxFetched: {
    [protocolID: string]: number | undefined
  }

  // only delegates with verified usernames
  verifiedDelegates: {
    [protocolID: string]: DelegateData[] | undefined
  }

  globalData: {
    [protocolID: string]: GlobaData | undefined
  }
}

export const initialState: GovernanceState = {
  activeProtocol: undefined,
  filterActive: false,

  // top delegates and pagination details
  topDelegates: {},
  maxFetched: {},

  verifiedDelegates: {},
  globalData: {}
}

export default createReducer(initialState, builder =>
  builder
    .addCase(updateActiveProtocol, (state, action) => {
      state.activeProtocol = action.payload.activeProtocol
    })
    .addCase(updateFilterActive, (state, action) => {
      state.filterActive = action.payload.filterActive
    })
    .addCase(updateTopDelegates, (state, action) => {
      state.topDelegates[action.payload.protocolID] = action.payload.topDelegates
    })
    .addCase(updateVerifiedDelegates, (state, action) => {
      state.verifiedDelegates[action.payload.protocolID] = action.payload.verifiedDelegates
    })
    .addCase(updateGlobalData, (state, action) => {
      state.globalData[action.payload.protocolID] = action.payload.data
    })
    .addCase(updateMaxFetched, (state, action) => {
      state.maxFetched[action.payload.protocolID] = action.payload.maxFetched
    })
)
