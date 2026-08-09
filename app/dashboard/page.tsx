import Nav from '@/components/Nav'
import DashboardClient from './DashboardClient'

// Server wrapper — see app/login/page.tsx for why this split exists.
export default function DashboardPage() {
  return <DashboardClient nav={<Nav />} />
}
