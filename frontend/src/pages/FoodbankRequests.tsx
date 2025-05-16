import { useState, useEffect } from 'react';
import { Request, FoodBank } from '@/types';
import { getRequests, updateRequest, getFoodbank } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import RequestsMap from '@/components/RequestsMap';
import { useAuth } from '@/contexts/AuthContext';

const FoodbankRequests = () => {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [foodbank, setFoodbank] = useState<FoodBank | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const { isAuthenticated, userRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || userRole !== 'foodbank') return;
      
      try {
        // First get the current foodbank details
        // For now, we'll use the user's ID to get the foodbank
        // In a real app, you'd have a more robust way to identify the current foodbank
        const foodbankData = await getFoodbank(1); // We'll use ID 1 for testing
        setFoodbank(foodbankData);
        
        // Get requests assigned to this foodbank
        const requestsData = await getRequests();
        // Filter only those assigned to this foodbank
        const assignedRequests = requestsData.filter(req => 
          req.assigned_to_id === foodbankData.id || req.status === 'Pending'
        );
        
        setAllRequests(assignedRequests);
        setFilteredRequests(assignedRequests);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load requests. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (activeStatus === 'all') {
      setFilteredRequests(allRequests);
    } else {
      setFilteredRequests(allRequests.filter(req => req.status === activeStatus));
    }
  }, [activeStatus, allRequests]);

  const handleStatusFilter = (status: string) => {
    setActiveStatus(status);
  };

  const handleFulfillRequest = async (requestId: number) => {
    setProcessingId(requestId);
    try {
      await updateRequest(requestId, 'Fulfilled');
      
      // Update local state
      setAllRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'Fulfilled', fulfilled_at: new Date().toISOString() } : req
        )
      );
    } catch (error) {
      console.error('Error fulfilling request:', error);
      alert('Failed to update request status. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAuthenticated || userRole !== 'foodbank') {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Access Restricted
        </h2>
        <p className="text-gray-600 mb-4">
          This page is only accessible to food bank administrators.
        </p>
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

  return (
    <div className="space-y-6">
      {/* Foodbank Info */}
      {foodbank && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">{foodbank.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {foodbank.location}, {foodbank.district}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
                <dd className="mt-1 text-sm text-gray-900">{foodbank.contact_info}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Assigned Requests</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {allRequests.filter(req => req.assigned_to_id === foodbank.id).length}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Map View */}
      <div className="bg-white shadow sm:rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Map</h3>
        <RequestsMap 
          districts={[]} 
          requests={filteredRequests} 
          height="400px" 
          foodbankView={true}
        />
      </div>

      {/* Requests List */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Food Aid Requests</h3>
        </div>
        
        {/* Filters */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-start space-x-4">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeStatus === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleStatusFilter('Pending')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeStatus === 'Pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => handleStatusFilter('Assigned')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeStatus === 'Assigned'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Assigned
            </button>
            <button
              onClick={() => handleStatusFilter('Fulfilled')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                activeStatus === 'Fulfilled'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Fulfilled
            </button>
          </div>
        </div>
        
        {filteredRequests.length === 0 ? (
          <div className="px-4 py-6 sm:px-6 text-center text-gray-500">
            No requests found matching the selected filter.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredRequests.map(request => (
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
                  
                  {(request.status === 'Assigned' && request.assigned_to_id === foodbank?.id) && (
                    <button
                      onClick={() => handleFulfillRequest(request.id)}
                      disabled={processingId === request.id}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {processingId === request.id ? 'Processing...' : 'Mark as Fulfilled'}
                    </button>
                  )}
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
                      {request.request_items.map(item => (
                        <span key={item.id} className="inline-flex items-center mr-2">
                          {item.food_item.name} ({item.quantity})
                        </span>
                      ))}
                    </p>
                  </div>
                  
                  {request.fulfilled_at && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Fulfilled on {new Date(request.fulfilled_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FoodbankRequests;