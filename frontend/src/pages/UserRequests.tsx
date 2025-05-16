import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Request } from '@/types';
import { getRequests } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';

const UserRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!isAuthenticated) return;
      
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('Failed to load your requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">You need to be logged in to view your requests</h2>
        <Link 
          to="/login"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">You haven't made any requests yet</h2>
          <p className="text-gray-600 mb-6">
            Create a new request to get food assistance from local food banks.
          </p>
          <Link 
            to="/request"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Create New Request
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg max-w-5xl mx-auto">
      <div className="border-b border-gray-200 px-4 py-5 sm:px-6 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Your Food Aid Requests</h2>
        <Link 
          to="/request"
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          New Request
        </Link>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {requests.map(request => (
          <li key={request.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="text-sm font-medium text-gray-900 sm:mr-4">
                  Request #{request.id}
                </p>
                <StatusBadge status={request.status} />
                <p className="text-sm text-gray-500 mt-1 sm:mt-0 sm:ml-4">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
              <Link
                to={`/requests/${request.id}`}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                View details
              </Link>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500 sm:mr-6">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {request.location}
                </p>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  {request.request_items.map(item => `${item.food_item.name} (${item.quantity})`).join(', ')}
                </p>
              </div>
              {request.assigned_to_id && (
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Assigned to Food Bank #{request.assigned_to_id}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserRequests;