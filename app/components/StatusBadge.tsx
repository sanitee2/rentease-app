import { PaymentStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: PaymentStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <span className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${getStatusStyle()}
    `}>
      {status}
    </span>
  );
};

export default StatusBadge; 