import React from 'react'
import { Redirect } from 'react-router-dom'
import { useLastSelectedProtocolID } from '../../state/user/hooks'
import useParsedQueryString from '../../hooks/useParsedQueryString'

export function RedirectWithUpdatedGovernance() {
  const [lastSelected] = useLastSelectedProtocolID()

  const { username: usernameQuery } = useParsedQueryString()
  const route = `delegates/${lastSelected ?? 'uniswap'}${usernameQuery ? '?username=' + usernameQuery : ''}`

  return <Redirect to={route} />
}
