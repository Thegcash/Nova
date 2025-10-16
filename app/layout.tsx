import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { 
  Home, 
  Radar, 
  LineChart, 
  HardDrive, 
  Shield, 
  AlertTriangle 
} from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nova Command Center',
  description: 'Fleet management and ROI tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          {/* Sidebar */}
          <aside className="sidebar">
            <div style={{marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)'}}>
              <h1 style={{fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0}}>
                Nova
              </h1>
              <p style={{fontSize: '12px', color: 'var(--text-tertiary)', margin: 0}}>
                Command Center
              </p>
            </div>

            <nav>
              <NavLink href="/" icon={<Home size={18} />}>
                Dashboard
              </NavLink>
              <NavLink href="/events" icon={<Radar size={18} />}>
                Events
              </NavLink>
              <NavLink href="/roi" icon={<LineChart size={18} />}>
                ROI
              </NavLink>
              <NavLink href="/alerts" icon={<AlertTriangle size={18} />}>
                Alerts
              </NavLink>
              <NavLink href="/policies" icon={<Shield size={18} />}>
                Policies
              </NavLink>
              <NavLink href="/exports" icon={<HardDrive size={18} />}>
                Exports
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

function NavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="nav-item">
      {icon}
      <span>{children}</span>
    </Link>
  )
}
