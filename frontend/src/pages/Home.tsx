import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { District, FoodBank } from '@/types';
import { getFoodbanks, getDistricts } from '@/services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';

const Home = () => {
  const [foodbanks, setFoodbanks] = useState<FoodBank[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodbanksData, districtsData] = await Promise.all([
          getFoodbanks(),
          getDistricts()
        ]);
        
        setFoodbanks(foodbanksData);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const foodbankIcon = new Icon({
    iconUrl: '/icons/foodbank-pin.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  return (
    <div className="space-y-12">
      {/* Hero section */}
      <div className="bg-white">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-200 to-secondary-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] pointer-events-none"></div>
          </div>
          
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                B40 Food Aid Management Platform
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Helping connect those in need with food resources across Malaysia. 
                Our platform coordinates between users, food banks, and organizations 
                to ensure efficient distribution of food aid.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/request"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Request Food Aid
                </Link>
                <Link 
                  to="/track" 
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm border border-primary-200 hover:bg-gray-50"
                >
                  Track Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works section */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">How It Works</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              A Simple Process for Food Aid
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform connects users in need with local food banks and aid organizations through a streamlined process.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                    1
                  </div>
                  Request Food Aid
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Submit a simple request using our icon-based interface. No registration required - just tell us what you need and where you are.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                    2
                  </div>
                  Get Tracking Number
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Receive a unique tracking number to monitor your request status anytime. Keep this number safe.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                    3
                  </div>
                  Assignment to Food Bank
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Our aid organizations review requests and assign them to the closest food bank with matching inventory.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                    4
                  </div>
                  Receive Your Aid Package
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  Once your request is fulfilled, you'll be notified when and where to collect your food aid package.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Our Network</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Food Banks Across Malaysia
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We partner with food banks throughout the country to ensure aid reaches those who need it most.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center mt-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="mt-8 h-[500px] rounded-lg overflow-hidden shadow-lg">
              <MapContainer 
                center={[3.140853, 101.693207]}
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
      </div>
    </div>
  );
};

export default Home;