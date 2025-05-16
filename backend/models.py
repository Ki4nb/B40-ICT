from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, JSON, Table, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import json
import uuid

from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # "user", "foodbank", "org"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    requests = relationship("Request", back_populates="user")
    foodbank = relationship("FoodBank", back_populates="admin", uselist=False)
    
class FoodBank(Base):
    __tablename__ = "foodbanks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    district = Column(String)
    contact_info = Column(String)
    admin_id = Column(Integer, ForeignKey("users.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    admin = relationship("User", back_populates="foodbank")
    inventory_items = relationship("InventoryItem", back_populates="foodbank")
    assigned_requests = relationship("Request", back_populates="assigned_to")

class FoodItem(Base):
    __tablename__ = "food_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    icon = Column(String)  # Path to icon
    category = Column(String)  # Basic, Protein, Baby, etc.
    
    # Relationships
    inventory_entries = relationship("InventoryItem", back_populates="food_item")
    request_items = relationship("RequestItem", back_populates="food_item")

class InventoryItem(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    foodbank_id = Column(Integer, ForeignKey("foodbanks.id"))
    food_item_id = Column(Integer, ForeignKey("food_items.id"))
    quantity = Column(Integer)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    foodbank = relationship("FoodBank", back_populates="inventory_items")
    food_item = relationship("FoodItem", back_populates="inventory_entries")

class Request(Base):
    __tablename__ = "requests"
    
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    location = Column(String)
    district = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    status = Column(String)  # "Pending", "Assigned", "Fulfilled", "Cancelled"
    assigned_to_id = Column(Integer, ForeignKey("foodbanks.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    fulfilled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="requests")
    request_items = relationship("RequestItem", back_populates="request")
    assigned_to = relationship("FoodBank", back_populates="assigned_requests")
    
    # Generate tracking number on instantiation
    def __init__(self, **kwargs):
        super(Request, self).__init__(**kwargs)
        if not self.tracking_number:
            # Generate a tracking number format: B40-XXXXXX
            self.tracking_number = f"B40-{uuid.uuid4().hex[:6].upper()}"

class RequestItem(Base):
    __tablename__ = "request_items"
    
    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("requests.id"))
    food_item_id = Column(Integer, ForeignKey("food_items.id"))
    quantity = Column(Integer, default=1)
    
    # Relationships
    request = relationship("Request", back_populates="request_items")
    food_item = relationship("FoodItem", back_populates="request_items")

class District(Base):
    __tablename__ = "districts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    state = Column(String)
    geojson = Column(String)  # Store GeoJSON as string
    
    def get_geojson(self):
        return json.loads(self.geojson)