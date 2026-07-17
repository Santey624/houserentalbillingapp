export function getSignInFailureMessage({
  emailVerified,
  passwordMatches,
}: {
  emailVerified: boolean
  passwordMatches: boolean
}) {
  if (!emailVerified && passwordMatches) {
    return 'Please verify your email before signing in. Check your inbox for the verification link.'
  }
  return 'Invalid email or password'
}
