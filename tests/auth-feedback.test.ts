import { describe, expect, it } from 'vitest'
import { getSignInFailureMessage } from '../lib/auth-feedback'

describe('getSignInFailureMessage', () => {
  it('returns verification guidance when credentials are correct but email is not verified', () => {
    expect(getSignInFailureMessage({ emailVerified: false, passwordMatches: true })).toBe(
      'Please verify your email before signing in. Check your inbox for the verification link.'
    )
  })

  it('returns generic credential error for wrong credentials', () => {
    expect(getSignInFailureMessage({ emailVerified: false, passwordMatches: false })).toBe(
      'Invalid email or password'
    )
  })
})
