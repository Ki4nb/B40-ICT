import { useState, useEffect } from 'react';
import { getFoodbanks } from '@/services/api';
import { FoodBank } from '@/types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

const Foodbanks = () => {
  const [foodbanks, setFoodbanks] = useState<FoodBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    const fetchFoodbanks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const district = districtFilter || undefined;
        const data = await getFoodbanks(district);
        setFoodbanks(data);
      } catch (error) {
        console.error('Error fetching foodbanks:', error);
        setError('Failed to load foodbanks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodbanks();
  }, [districtFilter]);

  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDistrictFilter(e.target.value);
  };

  const foodbankIcon = new Icon({
    iconUrl: '/icons/foodbank-pin.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Food Banks</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all food banks in the network
        </p>

        {/* Filter by district */}
        <div className="mt-4 max-w-md">
          <label htmlFor="districtFilter" className="block text-sm font-medium text-gray-700">
            Filter by District
          </label>
          <input
            type="text"
            name="districtFilter"
            id="districtFilter"
            placeholder="Enter district name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            value={districtFilter}
            onChange={handleDistrictChange}
          />
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Map View</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 h-[400px] rounded-lg overflow-hidden">
            <MapContainer
              center={[3.140853, 101.693207]} // Malaysia center
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {foodbanks.map(foodbank => (
                <Marker
                  key={foodbank.id}
                  position={[foodbank.latitude, foodbank.longitude]}
                  icon={foodbankIcon}
                >
                  <Popup>
                    <div>
                      <h3 className="font-bold">{foodbank.name}</h3>
                      <p><span className="font-semibold">Location:</span> {foodbank.location}</p>
                      <p><span className="font-semibold">District:</span> {foodbank.district}</p>
                      <p><span className="font-semibold">Contact:</span> {foodbank.contact_info}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* List View */}
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">List View</h2>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : foodbanks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">No food banks found.</p>
          </div>
        ) : (
          <div className="mt-4 flow-root">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">District</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {foodbanks.map((foodbank) => (
                      <tr key={foodbank.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {foodbank.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{foodbank.district}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{foodbank.location}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{foodbank.contact_info}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Foodbanks;