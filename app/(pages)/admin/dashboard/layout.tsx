import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rentease - Admin Dashboard',
  description: 'System administration and management dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 