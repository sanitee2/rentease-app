import { format } from 'date-fns';
import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

interface Payment {
  id: string;
  amount: number;
  date: Date;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface PaymentHistoryProps {
  payments: Payment[];
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <FaCheckCircle className="text-green-500 w-5 h-5" />;
      case 'FAILED':
        return <FaTimesCircle className="text-red-500 w-5 h-5" />;
      default:
        return <FaClock className="text-yellow-500 w-5 h-5" />;
    }
  };

  if (!payments.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No payment history available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div 
          key={payment.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-4">
            {getStatusIcon(payment.status)}
            <div>
              <p className="font-medium">₱{payment.amount.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(payment.date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : ''}
            ${payment.status === 'FAILED' ? 'bg-red-100 text-red-800' : ''}
            ${payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
          `}>
            {payment.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PaymentHistory; 