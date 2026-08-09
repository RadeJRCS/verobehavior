import Nav from '@/components/Nav'
import ContactClient from './ContactClient'

// Server wrapper — see app/login/page.tsx for why this split exists.
export default function ContactPage() {
  return <ContactClient nav={<Nav />} />
}
