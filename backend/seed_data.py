import json
import os
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
from database import SessionLocal, engine
from auth import get_password_hash

# Create tables
models.Base.metadata.create_all(bind=engine)

# Sample GeoJSON for a district
SAMPLE_DISTRICT_GEOJSON = json.dumps({
    "type": "Feature",
    "properties": {
        "name": "Kuala Lumpur"
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [
            [
                [101.6, 3.05],
                [101.8, 3.05],
                [101.8, 3.18],
                [101.6, 3.18],
                [101.6, 3.05]
            ]
        ]
    }
})

# Sample districts
districts = [
    {"name": "Kuala Lumpur", "state": "Federal Territory", "geojson": SAMPLE_DISTRICT_GEOJSON},
    {"name": "Petaling Jaya", "state": "Selangor", "geojson": json.dumps({
        "type": "Feature",
        "properties": {"name": "Petaling Jaya"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [101.5, 3.05],
                    [101.65, 3.05],
                    [101.65, 3.15],
                    [101.5, 3.15],
                    [101.5, 3.05]
                ]
            ]
        }
    })},
    {"name": "Johor Bahru", "state": "Johor", "geojson": json.dumps({
        "type": "Feature",
        "properties": {"name": "Johor Bahru"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [103.7, 1.45],
                    [103.8, 1.45],
                    [103.8, 1.55],
                    [103.7, 1.55],
                    [103.7, 1.45]
                ]
            ]
        }
    })}
]

# Sample food items with icons
food_items = [
    {"name": "Rice", "icon": "rice.svg", "category": "Basic"},
    {"name": "Eggs", "icon": "eggs.svg", "category": "Protein"},
    {"name": "Cooking Oil", "icon": "oil.svg", "category": "Basic"},
    {"name": "Infant Formula", "icon": "formula.svg", "category": "Baby"},
    {"name": "Diapers", "icon": "diaper.svg", "category": "Baby"},
    {"name": "Flour", "icon": "flour.svg", "category": "Basic"},
    {"name": "Canned Sardines", "icon": "sardines.svg", "category": "Protein"},
    {"name": "Milk", "icon": "milk.svg", "category": "Dairy"},
    {"name": "Instant Noodles", "icon": "noodles.svg", "category": "Basic"}
]

# Sample users
users = [
    {"username": "orgadmin", "email": "org@example.com", "password": "password", "role": "org"},
    {"username": "foodbank1", "email": "fb1@example.com", "password": "password", "role": "foodbank"},
    {"username": "foodbank2", "email": "fb2@example.com", "password": "password", "role": "foodbank"},
    {"username": "user1", "email": "user1@example.com", "password": "password", "role": "user"},
    {"username": "user2", "email": "user2@example.com", "password": "password", "role": "user"}
]

# Sample foodbanks
foodbanks = [
    {
        "name": "KL Food Bank",
        "location": "Sentul",
        "district": "Kuala Lumpur",
        "contact_info": "03-12345678",
        "latitude": 3.1746,
        "longitude": 101.6975,
        "admin_id": 2  # foodbank1 user
    },
    {
        "name": "PJ Relief Center",
        "location": "Damansara",
        "district": "Petaling Jaya",
        "contact_info": "03-87654321",
        "latitude": 3.1569,
        "longitude": 101.6304,
        "admin_id": 3  # foodbank2 user
    }
]

# Sample inventory
inventory_items = [
    {"foodbank_id": 1, "food_item_id": 1, "quantity": 50},  # Rice at KL Food Bank
    {"foodbank_id": 1, "food_item_id": 2, "quantity": 30},  # Eggs at KL Food Bank
    {"foodbank_id": 1, "food_item_id": 3, "quantity": 20},  # Oil at KL Food Bank
    {"foodbank_id": 1, "food_item_id": 9, "quantity": 100},  # Noodles at KL Food Bank
    {"foodbank_id": 2, "food_item_id": 1, "quantity": 40},  # Rice at PJ Relief Center
    {"foodbank_id": 2, "food_item_id": 4, "quantity": 15},  # Formula at PJ Relief Center
    {"foodbank_id": 2, "food_item_id": 5, "quantity": 25},  # Diapers at PJ Relief Center
    {"foodbank_id": 2, "food_item_id": 8, "quantity": 35}   # Milk at PJ Relief Center
]

# Sample requests with predefined tracking numbers for demo purposes
requests = [
    {
        "user_id": 4,  # user1
        "tracking_number": "B40-ABC123",
        "location": "Kampung Baru, Kuala Lumpur",
        "district": "Kuala Lumpur",
        "latitude": 3.1678,
        "longitude": 101.7069,
        "status": "Pending"
    },
    {
        "user_id": 4,  # user1
        "tracking_number": "B40-DEF456",
        "location": "Pantai Dalam, Kuala Lumpur",
        "district": "Kuala Lumpur",
        "latitude": 3.1106,
        "longitude": 101.6691,
        "status": "Assigned",
        "assigned_to_id": 1  # KL Food Bank
    },
    {
        "user_id": 5,  # user2
        "tracking_number": "B40-GHI789",
        "location": "SS2, Petaling Jaya",
        "district": "Petaling Jaya",
        "latitude": 3.1179,
        "longitude": 101.6231,
        "status": "Fulfilled",
        "assigned_to_id": 2,  # PJ Relief Center
        "fulfilled_at": func.now()
    }
]

# Sample request items
request_items = [
    {"request_id": 1, "food_item_id": 1, "quantity": 1},  # Rice for request 1
    {"request_id": 1, "food_item_id": 2, "quantity": 1},  # Eggs for request 1
    {"request_id": 2, "food_item_id": 1, "quantity": 1},  # Rice for request 2
    {"request_id": 2, "food_item_id": 3, "quantity": 1},  # Oil for request 2
    {"request_id": 2, "food_item_id": 9, "quantity": 2},  # 2 Noodles for request 2
    {"request_id": 3, "food_item_id": 4, "quantity": 1},  # Formula for request 3
    {"request_id": 3, "food_item_id": 5, "quantity": 1}   # Diapers for request 3
]

def seed_data():
    db = SessionLocal()
    try:
        # Check if data already exists
        user_count = db.query(func.count(models.User.id)).scalar()
        if user_count > 0:
            print("Database already contains data. Skipping seed.")
            return
        
        # Seed districts
        for district_data in districts:
            district = models.District(**district_data)
            db.add(district)
        
        # Seed food items
        for item_data in food_items:
            food_item = models.FoodItem(**item_data)
            db.add(food_item)
        
        # Seed users
        for user_data in users:
            hashed_password = get_password_hash(user_data.pop("password"))
            user = models.User(**user_data, hashed_password=hashed_password)
            db.add(user)
        
        # Commit to get IDs for users
        db.commit()
        
        # Seed foodbanks
        for foodbank_data in foodbanks:
            foodbank = models.FoodBank(**foodbank_data)
            db.add(foodbank)
        
        # Commit to get IDs for foodbanks
        db.commit()
        
        # Seed inventory
        for inv_data in inventory_items:
            inv_item = models.InventoryItem(**inv_data)
            db.add(inv_item)
        
        # Seed requests
        for req_data in requests:
            request = models.Request(**req_data)
            db.add(request)
        
        # Commit to get IDs for requests
        db.commit()
        
        # Seed request items
        for item_data in request_items:
            req_item = models.RequestItem(**item_data)
            db.add(req_item)
        
        db.commit()
        print("Database seeded successfully!")
    
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()