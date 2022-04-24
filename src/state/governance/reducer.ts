import { SerializedToken } from './../user/actions'
import { DelegateData } from './hooks'
import { ChainId, Token } from '@uniswap/sdk'
import {
  updateActiveProtocol,
  updateFilterActive,
  updateTopDelegates,
  updateVerifiedDelegates,
  updateGlobalData,
  updateMaxFetched,
  updateUtm,
} from './actions'
import { createReducer } from '@reduxjs/toolkit'
import UniLogo from '../../assets/images/uni-logo.png'
import Cre8rLogo from '../../assets/images/cre8r-logo.png'
import CompLogo from '../../assets/images/compLogo.png'
import HundredLogo from '../../assets/images/hundred-logo.png'
import BeanLogo from '../../assets/images/bean-logo.jpg'
import PoolLogo from '../../assets/images/pooltogether-icon.png'
import RadicleLogo from '../../assets/images/radicle-logo.svg'
import NounsLogo from '../../assets/images/nouns-logo.png'
import ENSLogo from '../../assets/images/ens.jpeg'
import AddAccount from '../../assets/images/AddAccount.png'

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
  baseUrl?: string // TODO - this should be required
  campaignBudget?:string
  video?:string
  description?:string
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
export const UNI_GOVERNANCE_ADDRESS_ALPHA_V0 = '0x5e4be8Bc9637f0EAA1A755019e06A68ce081D58F'
export const UNI_GOVERNANCE_ADDRESS_ALPHA_V1 = '0xC4e172459f1E7939D522503B81AFAaC1014CE6F6'
export const UNI_GOVERNANCE_ADDRESS_BRAVO = '0x408ED6354d4973f66138C91495F2f2FCbd8724C3'

export const UNI_ADDRESS = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
const UNI = new Token(ChainId.MAINNET, UNI_ADDRESS, 18, 'UNI', 'Uniswap')
export const UNISWAP_GOVERNANCE: GovernanceInfo = {
  id: 'uniswap',
  name: 'Uniswap Governance',
  logo: UniLogo,
  primaryColor: '#FF007A',
  secondaryColor: '#FDEEF5',
  token: serializeToken(UNI),
  governanceAlphaAddresses: [UNI_GOVERNANCE_ADDRESS_ALPHA_V0, UNI_GOVERNANCE_ADDRESS_ALPHA_V1],
  governanceAddressBravo: UNI_GOVERNANCE_ADDRESS_BRAVO,
  migrationProposalId: 8,
  social: '@Uniswap',
  emoji: '🦄',
  baseUrl:'https://uniswap.org/?'
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
  emoji: '🏦',
  //baseUrl: 'https://hundred.finance/?'
}

// export const H_GOVERNANCE_ADDRESS_BRAVO = '0xc0da02939e1441f497fd74f78ce7decb17b66529'
// export const COMP_GOVERNANCE_ADDRESS = '0xc0dA01a04C3f3E0be433606045bB7017A7323E38'
// export const COMP_ADDRESS = '0xc00e94cb662c3520282e6f5717214004a7f26888'
const HND = new Token(ChainId.MAINNET, COMP_ADDRESS, 18, 'HND', 'Hundred Governance Token')
export const HND_GOVERNANCE: GovernanceInfo = {
  id: 'HND',
  name: 'Hundred Finance',
  logo: HundredLogo,
  primaryColor: '#000000',
  secondaryColor: '#E1F9F1',
  token: serializeToken(HND),
  governanceAlphaAddresses: [COMP_GOVERNANCE_ADDRESS],
  governanceAddressBravo: COMP_GOVERNANCE_ADDRESS_BRAVO,
  migrationProposalId: 42,
  social: '@HundredFinance',
  emoji: '💯',
  baseUrl: 'https://hundred.finance/?',
  campaignBudget: '10,000 USD in $CRE8R & 30,000',
  video: 'https://www.youtube.com/embed/ccPUXuS4_Is', // ['https://www.youtube.com/embed/ccPUXuS4_Is','https://www.youtube.com/embed/BDQlJNiDav8'],
  description: `<b>In phase one of the campaign only wallets that have used Hundred Finance will be eligible for AmpliFi payouts.</b> Share Hundred Finance with your friends using your unique tracking link below and earn HND + CRE8R 
  You will be rewarded based on onchain data that can be tracked back to your unique link using AmpliFi`
}
export const AAVE_GOVERNANCE_ADDRESS = '0xEC568fffba86c094cf06b22134B23074DFE2252c'
export const AAVE_ADDRESS = '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'
const BEAN = new Token(ChainId.MAINNET, AAVE_ADDRESS, 18, 'BEAN', 'BEAN Token')
export const AAVE_GOVERNANCE: GovernanceInfo = {
  id: 'BEAN',
  name: 'Beanstalk Protocol',
  logo: BeanLogo,
  primaryColor: '#00D395',
  secondaryColor: '#E1F9F1',
  token: serializeToken(BEAN),
  governanceAlphaAddresses: [AAVE_GOVERNANCE_ADDRESS],
  social: '@BeanstalkFarms',
  emoji: '🌱',
  baseUrl: 'https://amplifi.cre8r.vip/#/amplifi/HND?',
  campaignBudget: 'Phase 1 has no budget, we just getting ready to save the BEANS!! Phase 2 soon tho ;)',
  video: 'https://www.youtube.com/embed/s6p3TFREmzg', // ['https://www.youtube.com/embed/ccPUXuS4_Is','https://www.youtube.com/embed/BDQlJNiDav8'],
  description: `<b>In phase one of the campaign the goal is to let people know about how they can help @beanstalkFarms in the build up to the  <a href="https://twitter.com/i/spaces/1BdGYwMyymBxX">Barn Raise</a>`
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
  emoji: '🏆',
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
  emoji: '🌱',
}

export const ENS_GOVERNANCE_ADDRESS = '0x690e775361AD66D1c4A25d89da9fCd639F5198eD'
export const ENS_ADDRESS = '0x31c8EAcBFFdD875c74b94b077895Bd78CF1E64A3'
const ENS = new Token(ChainId.MAINNET, RADICLE_ADDRESS, 18, 'ENS', 'Ethereum Name Service')
export const ENS_GOVERNANCE: GovernanceInfo = {
  id: 'ens',
  name: 'ENS Governance',
  logo: ENSLogo,
  primaryColor: '#5284ff',
  secondaryColor: '#cfddff',
  token: serializeToken(ENS),
  governanceAlphaAddresses: [ENS_GOVERNANCE_ADDRESS],
  social: '@ensdomains',
  emoji: '🌱',
}

export const CONNECT_CONFIG: GovernanceInfo = {
  id: 'connect',
  name: 'Connect Social Profile', // placeholder
  logo: AddAccount, // placeholder
  primaryColor: '#5284ff', // placeholder
  secondaryColor: '#cfddff', // placeholder
  token: serializeToken(ENS), //placeholder
  governanceAlphaAddresses: [ENS_GOVERNANCE_ADDRESS], //placeholder
  social: '@twitter', // placeholder
}

export const NOUNS_GOVERNANCE_ADDRESS_BRAVO = '0x6f3E6272A167e8AcCb32072d08E0957F9c79223d'
export const NOUNS_ADDRESS = '0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03'
const NOUN = new Token(ChainId.MAINNET, NOUNS_ADDRESS, 0, 'NOUN', 'Nouns')
const EMOJIS = ['🍕', '🤖', '🐶', '🍤', '🚘', '💍', '🐟', '👑', '🐋', '🐸']
export const NOUNS_GOVERNANCE: GovernanceInfo = {
  id: 'nouns',
  name: 'Nouns DAO Governance',
  logo: NounsLogo,
  primaryColor: '#D63C5E',
  secondaryColor: '#E8ECEF',
  token: serializeToken(NOUN),
  governanceAlphaAddresses: [],
  governanceAddressBravo: NOUNS_GOVERNANCE_ADDRESS_BRAVO,
  migrationProposalId: 0,
  social: '@nounsdao',
  emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
}

// #/connect or #/delegates/connect
// show only identity flow e.g. link to twitter
export function identityOnlyPath(pathname: string) {
  return pathname.split('/', 2)[1] == CONNECT_CONFIG.id || pathname.split('/', 3)[2] == CONNECT_CONFIG.id
}

export const CRE8R_GOVERNANCE_ADDRESS = '0xa832ce1b31bfb0961e78350320ab4cb7f110e7e2'
export const CRE8R_ADDRESS = '0x238d82a35e69d7c10fe69a649134171c63e57522'
const CRE8R = new Token(ChainId.MAINNET, CRE8R_ADDRESS, 18, 'CRE8R', 'CRE8R Cash')
export const CRE8R_GOVERNANCE: GovernanceInfo = {
  id: 'CRE8R',
  name: 'CRE8R Ampbassadooors',
  logo: Cre8rLogo,
  primaryColor: '#5555FF',
  secondaryColor: '#E3E3FF',
  token: serializeToken(CRE8R),
  governanceAlphaAddresses: [RADICLE_GOVERNANCE_ADDRESS],
  social: '@CRE8RDAO',
  emoji: '🧱',
  baseUrl: 'https://amplifi.cre8r.vip/?',
  campaignBudget: '50,000',
  video: 'https://www.youtube.com/embed/KwNfwxGmhxY',
  description: `Share CRE8R AmpliFi with your friends and earn $CRE8R tokens. Just copy your unique link below and share anywhere (responsibly). You will be rewarded with CRE8R tokens in several different ways over time.

  Based on:
  The number of people you refer, and the KPI goals that are hit on other campaigns in AmpliFi that can be attributed to your unique link. More info will be released on this as the system develops.`
}

// mapping for routing
export const SUPPORTED_PROTOCOLS: { [id: string]: GovernanceInfo } = {
  
  // compound: COMPOUND_GOVERNANCE,
   
  // pool: POOL_TOGETHER_GOVERNANCE,
  // radicle: RADICLE_GOVERNANCE,
  CRE8R: CRE8R_GOVERNANCE,
  HND: HND_GOVERNANCE,
  BEAN: AAVE_GOVERNANCE,
  //uniswap: UNISWAP_GOVERNANCE,
  // nouns: NOUNS_GOVERNANCE,
  // ens: ENS_GOVERNANCE,
  // connect: CONNECT_CONFIG,
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

  //utm links for delegates
  utm: {
    [protocolID: string]: string
  }
}

export const initialState: GovernanceState = {
  activeProtocol: undefined,
  filterActive: false,

  // top delegates and pagination details
  topDelegates: {},
  maxFetched: {},

  verifiedDelegates: {},
  globalData: {},
  utm: {}
}

export default createReducer(initialState, (builder) =>
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
    .addCase(updateUtm, (state, action) => {
      state.utm[action.payload.protocolID] = action.payload.utm
    })
)
