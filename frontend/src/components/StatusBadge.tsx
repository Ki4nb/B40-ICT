interface StatusBadgeProps {
  status: 'Pending' | 'Assigned' | 'Fulfilled' | 'Cancelled';
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Assigned':
        return 'bg-blue-100 text-blue-800';
      case 'Fulfilled':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-0.5 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusClasses()} ${sizeClasses}`}>
      {status}
    </span>
  );
};

export default StatusBadge;