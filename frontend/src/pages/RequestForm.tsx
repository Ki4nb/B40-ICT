import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FoodItem, District } from '@/types';
import { getFoodItems, getDistricts, createPublicRequest } from '@/services/api';
import FoodItemGrid from '@/components/FoodItemGrid';
import { useTranslation } from 'react-i18next';

const RequestForm = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    icNumber: '',
    address: '',
    district: '',
    phoneNumber: '',
    latitude: 0,
    longitude: 0,
    items: [] as Array<{ food_item_id: number; quantity: number }>
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [foodItemsData, districtsData] = await Promise.all([
          getFoodItems(),
          getDistricts()
        ]);
        
        setFoodItems(foodItemsData);
        setDistricts(districtsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load necessary data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemsChange = (selectedItems: Array<{ food_item_id: number; quantity: number }>) => {
    setFormData(prev => ({ ...prev, items: selectedItems }));
  };

  // Mock geolocation function - in a real app, this would use browser geolocation API
  const handleUseMyLocation = () => {
    // For demo purposes, set to KL coordinates
    setFormData(prev => ({
      ...prev,
      latitude: 3.139003,
      longitude: 101.686852
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.icNumber || !formData.address || !formData.district) {
      setError(t('requestForm.errorRequiredFields'));
      return;
    }
    
    if (formData.items.length === 0) {
      setError(t('requestForm.errorSelectItems'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use the public API endpoint
      const response = await createPublicRequest({
        first_name: formData.firstName,
        last_name: formData.lastName,
        ic_number: formData.icNumber,
        address: formData.address,
        district: formData.district,
        phone_number: formData.phoneNumber,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        items: formData.items
      });
      
      setSuccess(true);
      
      // Store the tracking number from the response
      if (response && response.tracking_number) {
        setTrackingNumber(response.tracking_number);
      }
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        icNumber: '',
        address: '',
        district: '',
        phoneNumber: '',
        latitude: 0,
        longitude: 0,
        items: []
      });
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(t('requestForm.errorSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 flex-col">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-2"></div>
        <p className="text-gray-600">{t('requestForm.loading')}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-3 text-xl font-medium text-gray-900">{t('requestForm.successTitle')}</h2>
          
          {trackingNumber && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md inline-block">
              <p className="text-sm text-gray-600 mb-1">{t('requestForm.trackingNumberTitle')}</p>
              <p className="text-xl font-bold text-primary-600">{trackingNumber}</p>
              <p className="mt-2 text-sm text-gray-500">
                {t('requestForm.trackingNumberDesc')}
              </p>
            </div>
          )}
          
          <p className="mt-4 text-gray-600">
            {t('requestForm.successDesc')}
          </p>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {t('requestForm.returnHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900">{t('requestForm.title')}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {t('requestForm.subtitle')}
      </p>
      
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
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
      )}
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{t('requestForm.selectItems')}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {t('requestForm.itemsDesc')}
          </p>
          <div className="mt-4">
            <FoodItemGrid 
              foodItems={foodItems} 
              onSelectionChange={handleItemsChange} 
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">{t('requestForm.yourInfo')}</h3>
          
          <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('requestForm.firstName')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('requestForm.lastName')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="icNumber" className="block text-sm font-medium text-gray-700">
                {t('requestForm.icNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="icNumber"
                  id="icNumber"
                  required
                  placeholder="e.g. 900101-10-1234"
                  value={formData.icNumber}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                {t('requestForm.phoneNumber')}
              </label>
              <div className="mt-1">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  placeholder="e.g. 012-3456789"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                {t('requestForm.address')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                {t('requestForm.district')} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">{t('requestForm.selectDistrict')}</option>
                  {districts.map(district => (
                    <option key={district.id} value={district.name}>
                      {district.name}, {district.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mt-6"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {t('requestForm.useLocation')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('requestForm.submitting')}
              </>
            ) : (
              t('requestForm.submit')
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;