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
import AaveLogo from '../../assets/images/aave-logo.png'
import PoolLogo from '../../assets/images/pooltogether-icon.png'
import RadicleLogo from '../../assets/images/radicle-logo.svg'
import Cre8rLogo from '../../assets/images/cre8r.png'
import { serializeToken } from '../user/hooks'

export interface GovernanceInfo {
  id: string
  name: string
  logo: string
  primaryColor: string
  secondaryColor: string
  token: SerializedToken
  governanceAlphaAddresses: string[]
  governanceAddressBravo?: string
  migrationProposalId?: number
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
export const UNI_GOVERNANCE_ADDRESS_BRAVO = '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6'
export const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
const UNI = new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap')
export const UNISWAP_GOVERNANCE: GovernanceInfo = {
  id: 'uniswap',
  name: 'Uniswap Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5',
  token: serializeToken(UNI),
  governanceAlphaAddresses: [UNI_GOVERNANCE_ADDRESS, UNI_GOVERNANCE_ADDRESS_BRAVO],
  migrationProposalId: 5,
  social: '@UniswapProtocol',
  emoji: '🦄'
}

export const COMP_GOVERNANCE_ADDRESS_BRAVO = '0xc0da02939e1441f497fd74f78ce7decb17b66529'
export const COMP_GOVERNANCE_ADDRESS = '0xc0dA01a04C3f3E0be433606045bB7017A7323E38'
export const COMP_ADDRESS = '0xc00e94cb662c3520282e6f5717214004a7f26888'
const COMP = new Token(ChainId.MAINNET, COMP_ADDRESS, 18, 'COMP', 'Compound Governance Token')
export const COMPOUND_GOVERNANCE: GovernanceInfo = {
  id: 'compound',
  name: 'Compound Governance',
  logo: CompLogo,
  primaryColor: '#00D395',
  secondaryColor: '#E1F9F1',
  token: serializeToken(COMP),
  governanceAlphaAddresses: [COMP_GOVERNANCE_ADDRESS],
  governanceAddressBravo: COMP_GOVERNANCE_ADDRESS_BRAVO,
  migrationProposalId: 42,
  social: '@compoundfinance',
  emoji: '🏦'
}

export const AAVE_GOVERNANCE_ADDRESS = '0xEC568fffba86c094cf06b22134B23074DFE2252c'
export const AAVE_ADDRESS = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'
const AAVE = new Token(ChainId.MAINNET, AAVE_ADDRESS, 18, 'AAVE', 'Aave Token')
export const AAVE_GOVERNANCE: GovernanceInfo = {
  id: 'aave',
  name: 'Aave Governance',
  logo: AaveLogo,
  primaryColor: '#B6509E',
  secondaryColor: '#ebfeff',
  token: serializeToken(AAVE),
  governanceAlphaAddresses: [AAVE_GOVERNANCE_ADDRESS],
  social: '@AaveAave',
  emoji: '👻'
}

export const POOL_TOGETHER_GOVERNANCE_ADDRESS = '0xB3a87172F555ae2a2AB79Be60B336D2F7D0187f0'
export const POOL_ADDRESS = '0x0cEC1A9154Ff802e7934Fc916Ed7Ca50bDE6844e'
const POOL = new Token(ChainId.MAINNET, POOL_ADDRESS, 18, 'POOL', 'PoolTogether')
export const POOL_TOGETHER_GOVERNANCE: GovernanceInfo = {
  id: 'pool',
  name: 'PoolTogether Governance',
  logo: PoolLogo,
  primaryColor: '#5c0ef3',
  secondaryColor: '#f2eeff',
  token: serializeToken(POOL),
  governanceAlphaAddresses: [POOL_TOGETHER_GOVERNANCE_ADDRESS],
  social: '@PoolTogether_',
  emoji: '🏆'
}

export const RADICLE_GOVERNANCE_ADDRESS = '0x690e775361AD66D1c4A25d89da9fCd639F5198eD'
export const RADICLE_ADDRESS = '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3'
const RADICLE = new Token(ChainId.MAINNET, RADICLE_ADDRESS, 18, 'RAD', 'Radicle')
export const RADICLE_GOVERNANCE: GovernanceInfo = {
  id: 'radicle',
  name: 'Radicle Governance',
  logo: RadicleLogo,
  primaryColor: '#5555FF',
  secondaryColor: '#E3E3FF',
  token: serializeToken(RADICLE),
  governanceAlphaAddresses: [RADICLE_GOVERNANCE_ADDRESS],
  social: '@radicle',
  emoji: '🌱'
}

export const CRE8R_GOVERNANCE_ADDRESS = '0xa832ce1b31bfb0961e78350320ab4cb7f110e7e2'
export const CRE8R_ADDRESS = '0x238d82a35e69d7c10fe69a649134171c63e57522'
const CRE8R = new Token(ChainId.MAINNET, CRE8R_ADDRESS, 18, 'CRE8R', 'CRE8R Cash')
export const CRE8R_GOVERNANCE: GovernanceInfo = {
  id: 'CRE8R',
  name: 'CRE8R Governance',
  logo: cre8rLogo,
  primaryColor: '#5555FF',
  secondaryColor: '#E3E3FF',
  token: serializeToken(CRE8R),
  governanceAlphaAddresses: [RADICLE_GOVERNANCE_ADDRESS],
  social: '@CRE8RDAO',
  emoji: '🧱'
}

// mapping for routing
export const SUPPORTED_PROTOCOLS: { [id: string]: GovernanceInfo } = {
  uniswap: UNISWAP_GOVERNANCE,
  compound: COMPOUND_GOVERNANCE,
  aave: AAVE_GOVERNANCE,
  pool: POOL_TOGETHER_GOVERNANCE,
  radicle: RADICLE_GOVERNANCE,
  CRE8R: CRE8R_GOVERNANCE
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
