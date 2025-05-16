import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DashboardStats, 
  District, 
  Request, 
  FoodBank 
} from '@/types';
import { 
  getDashboardStats, 
  getDistricts, 
  getRequests, 
  getFoodbanks, 
  updateRequest 
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import RequestsMap from '@/components/RequestsMap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const OrgDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [districts, setDistricts] = useState<District[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [foodbanks, setFoodbanks] = useState<FoodBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningRequestId, setAssigningRequestId] = useState<number | null>(null);
  const [assignToFoodbankId, setAssignToFoodbankId] = useState<number>(0);
  
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || userRole !== 'org') return;
      
      try {
        const [
          statsData,
          districtsData,
          pendingRequestsData,
          foodbanksData
        ] = await Promise.all([
          getDashboardStats(),
          getDistricts(),
          getRequests('Pending'),
          getFoodbanks()
        ]);
        
        setStats(statsData);
        setDistricts(districtsData);
        setPendingRequests(pendingRequestsData);
        setFoodbanks(foodbanksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, userRole]);

  const handleAssignRequest = async () => {
    if (!assigningRequestId || !assignToFoodbankId) return;
    
    try {
      await updateRequest(assigningRequestId, 'Assigned', assignToFoodbankId);
      
      // Update local state
      setPendingRequests(prev => prev.filter(req => req.id !== assigningRequestId));
      
      // Reset form
      setAssigningRequestId(null);
      setAssignToFoodbankId(0);
    } catch (error) {
      console.error('Error assigning request:', error);
      alert('Failed to assign request. Please try again.');
    }
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Prepare data for pie chart
  const statusData = stats ? [
    { name: 'Pending', value: stats.pending_requests },
    { name: 'Assigned', value: stats.assigned_requests },
    { name: 'Fulfilled', value: stats.fulfilled_requests }
  ] : [];

  // Prepare data for district bar chart
  const districtData = stats?.district_stats.map(district => ({
    name: district.district,
    pending: district.pending_requests,
    assigned: district.assigned_requests,
    fulfilled: district.fulfilled_requests
  })) || [];

  if (!isAuthenticated || userRole !== 'org') {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Access Restricted
        </h2>
        <p className="text-gray-600 mb-4">
          This page is only accessible to organization administrators.
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
      {/* Stats Overview */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Overview</h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Requests</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats?.total_requests}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                <dd className="mt-1 text-3xl font-semibold text-yellow-600">{stats?.pending_requests}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Assigned Requests</dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats?.assigned_requests}</dd>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Fulfilled Requests</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{stats?.fulfilled_requests}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Request Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} requests`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Requests by District</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#FFBB28" />
                  <Bar dataKey="assigned" name="Assigned" fill="#0088FE" />
                  <Bar dataKey="fulfilled" name="Fulfilled" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Request Map</h3>
          <RequestsMap
            districts={districts}
            requests={pendingRequests}
            height="400px"
          />
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Pending Requests</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Assign pending requests to available food banks.
          </p>
        </div>
        
        {pendingRequests.length === 0 ? (
          <div className="px-4 py-6 sm:px-6 text-center text-gray-500">
            No pending requests to display.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {pendingRequests.map(request => (
              <li key={request.id} className="px-4 py-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">Request #{request.id}</p>
                      <StatusBadge status={request.status} size="sm" className="ml-2" />
                      <p className="ml-2 text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-semibold">Location:</span> {request.location}, {request.district}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      <span className="font-semibold">Items:</span> {request.request_items.map(item => `${item.food_item.name} (${item.quantity})`).join(', ')}
                    </p>
                  </div>
                  
                  {assigningRequestId === request.id ? (
                    <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <select
                        className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        value={assignToFoodbankId}
                        onChange={(e) => setAssignToFoodbankId(parseInt(e.target.value))}
                      >
                        <option value={0}>Select a food bank</option>
                        {foodbanks
                          .filter(fb => fb.district === request.district)
                          .map(fb => (
                            <option key={fb.id} value={fb.id}>
                              {fb.name} ({fb.location})
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={handleAssignRequest}
                        disabled={!assignToFoodbankId}
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setAssigningRequestId(null)}
                        className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAssigningRequestId(request.id)}
                      className="mt-3 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Assign Request
                    </button>
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

export default OrgDashboard;