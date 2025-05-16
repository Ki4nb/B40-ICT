import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trackRequest } from '@/services/api';

interface TrackingResult {
  tracking_number: string;
  status: string;
  created_at: string;
  fulfilled_at: string | null;
  items: Array<{ name: string; quantity: number }>;
  foodbank: {
    name: string;
    location: string;
    contact_info: string;
  } | null;
}

const TrackRequest = () => {
  const { t, i18n } = useTranslation();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackingResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError(t('trackRequest.errors.emptyTracking'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await trackRequest(trackingNumber.trim());
      setResult(response);
    } catch (error: any) {
      console.error('Error tracking request:', error);
      if (error.response?.status === 404) {
        setError(t('trackRequest.errors.notFound'));
      } else {
        setError(t('trackRequest.errors.general'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Map status to colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Assigned':
        return 'text-blue-600 bg-blue-100';
      case 'Fulfilled':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  // Translate status
  const translateStatus = (status: string) => {
    switch (status) {
      case 'Pending':
        return t('trackRequest.status.pending');
      case 'Assigned':
        return t('trackRequest.status.assigned');
      case 'Fulfilled':
        return t('trackRequest.status.fulfilled');
      case 'Cancelled':
        return t('trackRequest.status.cancelled');
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = i18n.language === 'ms' ? 'ms-MY' : 'en-MY';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900">{t('trackRequest.title')}</h2>
      <p className="mt-1 text-sm text-gray-600">
        {t('trackRequest.subtitle')}
      </p>
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700">
            {t('trackRequest.trackingNumber')}
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="trackingNumber"
              id="trackingNumber"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder={t('trackRequest.placeholder')}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isLoading ? t('trackRequest.tracking') : t('trackRequest.trackButton')}
            </button>
          </div>
        </div>
        
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
      </form>
      
      {result && (
        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{t('trackRequest.requestInfo.request')} {result.tracking_number}</h3>
              <p className="text-sm text-gray-500">{t('trackRequest.requestInfo.submitted')}: {formatDate(result.created_at)}</p>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
              {translateStatus(result.status)}
            </div>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('trackRequest.requestInfo.itemsRequested')}</h4>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {result.items.map((item, index) => (
                <li key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">x{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {result.foodbank && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{t('trackRequest.requestInfo.assignedFoodBank')}</h4>
              <div className="mt-3 bg-blue-50 rounded-md p-4">
                <p className="text-sm font-medium text-gray-700">{result.foodbank.name}</p>
                <p className="text-sm text-gray-500 mt-1">{t('trackRequest.requestInfo.location')}: {result.foodbank.location}</p>
                <p className="text-sm text-gray-500 mt-1">{t('trackRequest.requestInfo.contact')}: {result.foodbank.contact_info}</p>
              </div>
            </div>
          )}
          
          {result.fulfilled_at && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="bg-green-50 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {t('trackRequest.requestInfo.fulfilled')} {formatDate(result.fulfilled_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackRequest;