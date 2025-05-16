import axios from 'axios';
import {
  User,
  FoodItem,
  InventoryItem,
  FoodBank,
  FoodBankWithInventory,
  Request,
  District,
  DashboardStats,
  Token,
  LoginCredentials
} from '@/types';

// API base URL for backend
const API_BASE_URL = 'API URL';

// Create two axios instances - one with auth, one without
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

const publicApi = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

// Add token to API requests for authenticated endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const login = async (username: string, password: string): Promise<Token> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  
  const response = await axios.post<Token>(`${API_BASE_URL}/token`, formData);
  return response.data;
};

export const register = async (userData: LoginCredentials & { email: string, role: string }): Promise<User> => {
  const response = await axios.post<User>(`${API_BASE_URL}/register`, userData);
  return response.data;
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await axios.get<User>(`${API_BASE_URL}/api/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};

// Food Items - public access
export const getFoodItems = async (): Promise<FoodItem[]> => {
  const response = await publicApi.get<FoodItem[]>('/food-items');
  return response.data;
};

// Districts - public access
export const getDistricts = async (): Promise<District[]> => {
  const response = await publicApi.get<District[]>('/districts');
  return response.data;
};

// Foodbanks
export const getFoodbanks = async (district?: string): Promise<FoodBank[]> => {
  const params = district ? { district } : {};
  const response = await api.get<FoodBank[]>('/foodbanks', { params });
  return response.data;
};

export const getFoodbank = async (id: number): Promise<FoodBankWithInventory> => {
  const response = await api.get<FoodBankWithInventory>(`/foodbanks/${id}`);
  return response.data;
};

// Inventory
export const getFoodbankInventory = async (foodbankId: number): Promise<InventoryItem[]> => {
  const response = await api.get<InventoryItem[]>(`/foodbanks/${foodbankId}/inventory`);
  return response.data;
};

export const updateInventoryItem = async (
  foodbankId: number,
  itemId: number,
  quantity: number
): Promise<InventoryItem> => {
  const response = await api.put<InventoryItem>(
    `/foodbanks/${foodbankId}/inventory/${itemId}`,
    { quantity }
  );
  return response.data;
};

export const addInventoryItem = async (
  foodbankId: number,
  food_item_id: number,
  quantity: number
): Promise<InventoryItem> => {
  const response = await api.post<InventoryItem>(
    `/foodbanks/${foodbankId}/inventory`,
    { food_item_id, quantity }
  );
  return response.data;
};

// Requests
export const getRequests = async (status?: string, district?: string): Promise<Request[]> => {
  const params = { ...(status && { status }), ...(district && { district }) };
  const response = await api.get<Request[]>('/requests', { params });
  return response.data;
};

export const getRequest = async (id: number): Promise<Request> => {
  const response = await api.get<Request>(`/requests/${id}`);
  return response.data;
};

export const createRequest = async (requestData: {
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  items: Array<{ food_item_id: number; quantity: number }>;
}): Promise<Request> => {
  const response = await api.post<Request>('/requests', requestData);
  return response.data;
};

export const updateRequest = async (
  id: number,
  status?: string,
  assigned_to_id?: number | null
): Promise<Request> => {
  const response = await api.put<Request>(`/requests/${id}`, {
    status,
    assigned_to_id
  });
  return response.data;
};

// Public request
export const createPublicRequest = async (requestData: {
  first_name: string;
  last_name: string;
  ic_number: string;
  address: string;
  district: string;
  phone_number?: string;
  latitude: number;
  longitude: number;
  items: Array<{ food_item_id: number; quantity: number }>;
}): Promise<any> => {
  const response = await publicApi.post('/public/requests', requestData);
  return response.data;
};

// Public track
export const trackRequest = async (trackingNumber: string): Promise<any> => {
  const response = await publicApi.get(`/public/track/${trackingNumber}`);
  return response.data;
};

// Stats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/stats/dashboard');
  return response.data;
};
