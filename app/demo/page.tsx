import Nav from '@/components/Nav'
import DemoClient from './DemoClient'

// Server wrapper — see app/login/page.tsx for why this split exists.
export default function DemoPage() {
  return <DemoClient nav={<Nav />} />
}
