import Nav from '@/components/Nav'
import LoginClient from './LoginClient'

// Server wrapper: Nav needs next/headers (cookies) to read the session,
// which cannot be pulled into a client-marked file. Rendering it here and
// passing it down as a prop keeps LoginClient's logic entirely unchanged.
export default function LoginPage() {
  return <LoginClient nav={<Nav />} />
}
