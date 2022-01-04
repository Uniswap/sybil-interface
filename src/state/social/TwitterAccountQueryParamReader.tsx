import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { parse } from 'qs'
import { useTwitterAccount } from '../user/hooks'

/**
 * Used for redirects from Twitter oauth server.
 * If twitter handle passed as query param, set in global state.
 * @param param0 twitter handle
 */
export default function TwitterAccountQueryParamReader({ location: { search } }: RouteComponentProps): null {
  const [, setTwitterAccount] = useTwitterAccount()

  useEffect(() => {
    if (!search) return
    if (search.length < 2) return

    const parsed = parse(search, {
      parseArrays: false,
      ignoreQueryPrefix: true,
    })

    const username = parsed.username

    if (typeof username !== 'string') return

    setTwitterAccount(username)
  }, [search, setTwitterAccount])

  return null
}
