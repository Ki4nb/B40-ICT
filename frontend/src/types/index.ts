export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'foodbank' | 'org';
  is_active: boolean;
  created_at: string;
}

export interface FoodItem {
  id: number;
  name: string;
  icon: string;
  category: string;
}

export interface InventoryItem {
  id: number;
  foodbank_id: number;
  food_item_id: number;
  food_item: FoodItem;
  quantity: number;
  last_updated: string;
}

export interface FoodBank {
  id: number;
  name: string;
  location: string;
  district: string;
  contact_info: string;
  admin_id: number;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface FoodBankWithInventory extends FoodBank {
  inventory_items: InventoryItem[];
}

export interface RequestItem {
  id: number;
  request_id: number;
  food_item_id: number;
  food_item: FoodItem;
  quantity: number;
}

export interface Request {
  id: number;
  user_id: number;
  location: string;
  district: string;
  latitude: number;
  longitude: number;
  status: 'Pending' | 'Assigned' | 'Fulfilled' | 'Cancelled';
  assigned_to_id: number | null;
  created_at: string;
  fulfilled_at: string | null;
  request_items: RequestItem[];
}

export interface District {
  id: number;
  name: string;
  state: string;
  geojson: string;
}

export interface DistrictStats {
  district: string;
  total_requests: number;
  pending_requests: number;
  assigned_requests: number;
  fulfilled_requests: number;
}

export interface InventoryStats {
  food_item: string;
  total_quantity: number;
  foodbanks: Record<string, number>;
}

export interface DashboardStats {
  total_requests: number;
  pending_requests: number;
  assigned_requests: number;
  fulfilled_requests: number;
  district_stats: DistrictStats[];
  inventory_stats: InventoryStats[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface DecodedToken {
  sub: string;
  role: 'user' | 'foodbank' | 'org';
  exp: number;
}