import { useState } from 'react';
import { Request, FoodBank } from '@/types';
import { updateRequest, getFoodbanks } from '@/services/api';

interface RequestCardProps {
  request: Request;
  showActions?: boolean;
  showAssign?: boolean;
  onUpdate?: () => void;
}

const RequestCard = ({ request, showActions = false, showAssign = false, onUpdate }: RequestCardProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodbanks, setFoodbanks] = useState<FoodBank[]>([]);
  const [selectedFoodbank, setSelectedFoodbank] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
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

  const handleShowAssign = async () => {
    setIsAssigning(true);
    setError(null);
    try {
      const data = await getFoodbanks();
      setFoodbanks(data);
      
      // If this is a reassignment, initialize with the current assignment
      if (request.status === 'Assigned' && request.assigned_to_id) {
        setSelectedFoodbank(request.assigned_to_id);
      }
    } catch (error) {
      console.error('Error fetching foodbanks:', error);
      setError('Failed to load food banks.');
    }
  };

  const handleAssign = async () => {
    if (!selectedFoodbank) {
      setError('Please select a food bank.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use the current status if it's already assigned, otherwise set it to 'Assigned'
      const newStatus = request.status === 'Assigned' ? request.status : 'Assigned';
      await updateRequest(request.id, newStatus, selectedFoodbank);
      setIsAssigning(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error assigning request:', error);
      setError('Failed to assign request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfill = async () => {
    setIsFulfilling(true);
    setIsLoading(true);
    setError(null);
    try {
      await updateRequest(request.id, 'Fulfilled');
      setIsFulfilling(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error fulfilling request:', error);
      setError('Failed to mark as fulfilled. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Request #{request.id}</h3>
            <p className="text-sm text-gray-500">Created: {formatDate(request.created_at)}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 sm:px-6">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Requested Items</h4>
        <ul className="space-y-1">
          {request.request_items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span className="text-sm text-gray-700">{item.food_item.name}</span>
              <span className="text-sm text-gray-500">x{item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3 bg-gray-50 sm:px-6">
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Requester Location</h4>
        <p className="text-sm text-gray-700">{request.location}</p>
        <p className="text-sm text-gray-500">{request.district}</p>
      </div>

      {request.assigned_to_id && (
        <div className="px-4 py-3 sm:px-6 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Assigned To</h4>
          <p className="text-sm font-medium text-primary-600">Foodbank #{request.assigned_to_id}</p>
        </div>
      )}

      {showActions && (
        <div className="px-4 py-3 sm:px-6 border-t border-gray-200">
          {error && (
            <div className="mb-3 rounded-md bg-red-50 p-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isAssigning ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {request.status === 'Assigned' ? 'Reassign Food Bank' : 'Select Food Bank'}
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  value={selectedFoodbank || ''}
                  onChange={(e) => setSelectedFoodbank(Number(e.target.value))}
                >
                  <option value="">Select a food bank</option>
                  {foodbanks.map(fb => (
                    <option key={fb.id} value={fb.id}>
                      {fb.name} ({fb.district})
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleAssign}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : request.status === 'Assigned' ? 'Confirm Reassignment' : 'Confirm Assignment'}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => setIsAssigning(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {showAssign && request.status === 'Pending' && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={handleShowAssign}
                >
                  Assign to Food Bank
                </button>
              )}
              
              {request.status === 'Assigned' && (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handleFulfill}
                    disabled={isFulfilling}
                  >
                    {isFulfilling ? 'Processing...' : 'Mark as Fulfilled'}
                  </button>
                  {showAssign && (
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handleShowAssign}
                    >
                      Reassign
                    </button>
                  )}
                </>
              )}
              
              {(request.status === 'Pending' || request.status === 'Assigned') && (
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  onClick={async () => {
                    try {
                      await updateRequest(request.id, 'Cancelled');
                      if (onUpdate) onUpdate();
                    } catch (error) {
                      console.error('Error cancelling request:', error);
                      setError('Failed to cancel request.');
                    }
                  }}
                >
                  Cancel Request
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestCard;