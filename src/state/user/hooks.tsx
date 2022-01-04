import { Pair, Token } from '@uniswap/sdk'
import { useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from '../index'
import {
  SerializedToken,
  updateUserDarkMode,
  toggleURLWarning,
  updateTwitterAccount,
  updateLastSelectedProtocolID,
} from './actions'

export function serializeToken(token: Token): SerializedToken {
  return {
    chainId: token.chainId,
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    name: token.name,
  }
}

export function deserializeToken(serializedToken: SerializedToken): Token {
  return new Token(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name
  )
}

export function useIsDarkMode(): boolean {
  const { userDarkMode, matchesDarkMode } = useSelector<
    AppState,
    { userDarkMode: boolean | null; matchesDarkMode: boolean }
  >(
    ({ user: { matchesDarkMode, userDarkMode } }) => ({
      userDarkMode,
      matchesDarkMode,
    }),
    shallowEqual
  )

  return userDarkMode === null ? matchesDarkMode : userDarkMode
}

export function useDarkModeManager(): [boolean, () => void] {
  const dispatch = useDispatch<AppDispatch>()
  const darkMode = useIsDarkMode()

  const toggleSetDarkMode = useCallback(() => {
    dispatch(updateUserDarkMode({ userDarkMode: !darkMode }))
  }, [darkMode, dispatch])

  return [darkMode, toggleSetDarkMode]
}

// use for twitter login passed through query param
export function useTwitterAccount(): [string | undefined, (newAccount: string | undefined) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const twitterAccount = useSelector<AppState, AppState['user']['twitterAccount']>((state) => state.user.twitterAccount)

  // set new or reset account
  const setTwitterAccount = useCallback(
    (newAccount: string | undefined) => {
      dispatch(updateTwitterAccount({ twitterAccount: newAccount }))
    },
    [dispatch]
  )
  return [twitterAccount, setTwitterAccount]
}

// use for twitter login passed through query param
export function useLastSelectedProtocolID(): [string | undefined, (protocolID: string | undefined) => void] {
  const dispatch = useDispatch<AppDispatch>()
  const lastSelectedProtocolID = useSelector<AppState, AppState['user']['lastSelectedProtocolID']>(
    (state) => state.user.lastSelectedProtocolID
  )

  // set new or reset account
  const setLastSelectedProtocolID = useCallback(
    (protocolID: string | undefined) => {
      dispatch(updateLastSelectedProtocolID({ protocolID: protocolID }))
    },
    [dispatch]
  )
  return [lastSelectedProtocolID, setLastSelectedProtocolID]
}

export function useURLWarningVisible(): boolean {
  return useSelector((state: AppState) => state.user.URLWarningVisible)
}

export function useURLWarningToggle(): () => void {
  const dispatch = useDispatch()
  return useCallback(() => dispatch(toggleURLWarning()), [dispatch])
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toV2LiquidityToken([tokenA, tokenB]: [Token, Token]): Token {
  return new Token(tokenA.chainId, Pair.getAddress(tokenA, tokenB), 18, 'UNI-V2', 'Uniswap V2')
}
