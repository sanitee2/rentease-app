export const STATUS_STYLES = {
  PENDING: {
    bg: 'bg-yellow-50',
    color: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  IN_PROGRESS: {
    bg: 'bg-blue-50',
    color: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  },
  COMPLETED: {
    bg: 'bg-green-50',
    color: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  },
  CANCELLED: {
    bg: 'bg-red-50',
    color: 'text-red-700',
    badge: 'bg-red-100 text-red-800'
  }
} as const;

export const PRIORITY_STYLES = {
  URGENT: {
    bg: 'bg-red-50',
    color: 'text-red-700',
    badge: 'bg-red-100 text-red-800'
  },
  HIGH: {
    bg: 'bg-yellow-50',
    color: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  MEDIUM: {
    bg: 'bg-blue-50',
    color: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  },
  LOW: {
    bg: 'bg-green-50',
    color: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  }
} as const; 