import React from 'react'
import { ButtonPrimary } from '../Button'

export default function TwitterLoginButton() {
  const REQUEST_TOKEN_ENDPOINT = 'http://localhost:8080/login/twitter'

  async function tryLogin() {
    fetch(REQUEST_TOKEN_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res => {
      console.log(res)
    })
  }

  return <ButtonPrimary onClick={tryLogin}>Login with twitter</ButtonPrimary>
}
