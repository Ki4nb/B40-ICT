import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { District, Request } from '@/types';

interface RequestsMapProps {
  districts: District[];
  requests?: Request[];
  height?: string;
  foodbankView?: boolean;
}

const RequestsMap = ({ 
  districts, 
  requests = [], 
  height = '500px',
  foodbankView = false 
}: RequestsMapProps) => {
  const [geoJsonData, setGeoJsonData] = useState<any[]>([]);
  
  // Custom marker icons
  const requestIcon = new Icon({
    iconUrl: '/icons/request-pin.svg',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25],
  });

  const foodbankIcon = new Icon({
    iconUrl: '/icons/foodbank-pin.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  useEffect(() => {
    // Parse GeoJSON from districts
    const parsedGeoJson = districts.map(district => {
      try {
        return {
          ...JSON.parse(district.geojson),
          properties: {
            ...JSON.parse(district.geojson).properties,
            name: district.name,
            state: district.state,
            requests: requests.filter(r => r.district === district.name).length,
            pending: requests.filter(r => r.district === district.name && r.status === 'Pending').length
          }
        };
      } catch (error) {
        console.error(`Error parsing GeoJSON for district ${district.name}:`, error);
        return null;
      }
    }).filter(Boolean);
    
    setGeoJsonData(parsedGeoJson);
  }, [districts, requests]);

  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      layer.bindPopup(`
        <strong>${feature.properties.name}</strong><br/>
        State: ${feature.properties.state}<br/>
        Requests: ${feature.properties.requests}<br/>
        Pending: ${feature.properties.pending}
      `);
    }
  };

  const getDistrictStyle = (feature: any) => {
    const pendingCount = feature.properties.pending || 0;
    
    // Color intensity based on pending requests
    const baseOpacity = 0.2;
    const maxOpacity = 0.7;
    const opacity = baseOpacity + Math.min(pendingCount / 20, 1) * (maxOpacity - baseOpacity);
    
    return {
      fillColor: '#ef4444',
      weight: 1,
      opacity: 0.7,
      color: '#991b1b',
      fillOpacity: opacity
    };
  };

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={[3.140853, 101.693207]} // Malaysia's center
        zoom={7}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* District polygons */}
        {geoJsonData.map((geoJson, index) => (
          <GeoJSON 
            key={`district-${index}`}
            data={geoJson as any}
            style={getDistrictStyle}
            onEachFeature={onEachFeature}
          />
        ))}
        
        {/* Request markers */}
        {requests.map(request => (
          <Marker
            key={`request-${request.id}`}
            position={[request.latitude, request.longitude]}
            icon={requestIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">Request #{request.id}</h3>
                <p><span className="font-semibold">Location:</span> {request.location}</p>
                <p><span className="font-semibold">Status:</span> {request.status}</p>
                <p><span className="font-semibold">Items:</span> {request.request_items.map(item => item.food_item.name).join(', ')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Foodbank markers when viewing in foodbank mode */}
        {foodbankView && requests
          .filter(request => request.assigned_to_id)
          .map(request => (
            <Marker
              key={`foodbank-${request.assigned_to_id}`}
              position={[request.latitude + 0.01, request.longitude + 0.01]} // Slight offset
              icon={foodbankIcon}
            >
              <Popup>
                <div>
                  <h3 className="font-bold">Assigned to Foodbank #{request.assigned_to_id}</h3>
                </div>
              </Popup>
            </Marker>
          ))
        }
      </MapContainer>
    </div>
  );
};

export default RequestsMap;