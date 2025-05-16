from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role: str

class User(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Food Item schemas
class FoodItemBase(BaseModel):
    name: str
    icon: str
    category: str

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: int
    
    class Config:
        orm_mode = True

# Inventory schemas
class InventoryItemBase(BaseModel):
    food_item_id: int
    quantity: int

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    quantity: int

class InventoryItem(InventoryItemBase):
    id: int
    foodbank_id: int
    last_updated: datetime
    food_item: FoodItem
    
    class Config:
        orm_mode = True

# Food Bank schemas
class FoodBankBase(BaseModel):
    name: str
    location: str
    district: str
    contact_info: str
    latitude: float
    longitude: float

class FoodBankCreate(FoodBankBase):
    admin_id: int

class FoodBank(FoodBankBase):
    id: int
    admin_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class FoodBankWithInventory(FoodBank):
    inventory_items: List[InventoryItem]
    
    class Config:
        orm_mode = True

# Request item schemas
class RequestItemBase(BaseModel):
    food_item_id: int
    quantity: int = 1

class RequestItemCreate(RequestItemBase):
    pass

class RequestItem(RequestItemBase):
    id: int
    request_id: int
    food_item: FoodItem
    
    class Config:
        orm_mode = True

# Request schemas
class RequestBase(BaseModel):
    location: str
    district: str
    latitude: float
    longitude: float

class RequestCreate(RequestBase):
    items: List[RequestItemCreate]

class Request(RequestBase):
    id: int
    tracking_number: str  # Added tracking number
    user_id: int
    status: str
    created_at: datetime
    fulfilled_at: Optional[datetime] = None
    assigned_to_id: Optional[int] = None
    request_items: List[RequestItem]
    
    class Config:
        orm_mode = True

class RequestUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None

# District schemas
class DistrictBase(BaseModel):
    name: str
    state: str
    geojson: str

class DistrictCreate(DistrictBase):
    pass

class District(DistrictBase):
    id: int
    
    class Config:
        orm_mode = True

# Stats schemas
class DistrictStats(BaseModel):
    district: str
    total_requests: int
    pending_requests: int
    assigned_requests: int
    fulfilled_requests: int

class InventoryStats(BaseModel):
    food_item: str
    total_quantity: int
    foodbanks: Dict[str, int]

class DashboardStats(BaseModel):
    total_requests: int
    pending_requests: int
    assigned_requests: int
    fulfilled_requests: int
    district_stats: List[DistrictStats]
    inventory_stats: List[InventoryStats]

# Login schemas
class Login(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str