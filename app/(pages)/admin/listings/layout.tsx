import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentease - Admin Listings',
  description: 'Manage system listings',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 