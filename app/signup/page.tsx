import Nav from '@/components/Nav'
import SignupClient from './SignupClient'

// Server wrapper: Nav needs next/headers (cookies) to read the session,
// which cannot be pulled into a client-marked file. Rendering it here and
// passing it down as a prop keeps SignupClient's logic entirely unchanged.
export default function SignupPage() {
  return <SignupClient nav={<Nav />} />
}
