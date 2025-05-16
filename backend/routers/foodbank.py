from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_active_user, get_current_foodbank_user, get_current_org_user

router = APIRouter(tags=["foodbank"])

# Foodbank CRUD operations
@router.post("/foodbanks", response_model=schemas.FoodBank)
def create_foodbank(
    foodbank: schemas.FoodBankCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_org_user)
):
    # Only org users can create foodbanks
    # Check if admin_id exists and has role "foodbank"
    admin = db.query(models.User).filter(models.User.id == foodbank.admin_id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")
    
    if admin.role != "foodbank":
        raise HTTPException(status_code=400, detail="Admin user must have role 'foodbank'")
    
    # Create new foodbank
    db_foodbank = models.FoodBank(
        name=foodbank.name,
        location=foodbank.location,
        district=foodbank.district,
        contact_info=foodbank.contact_info,
        admin_id=foodbank.admin_id,
        latitude=foodbank.latitude,
        longitude=foodbank.longitude
    )
    db.add(db_foodbank)
    db.commit()
    db.refresh(db_foodbank)
    return db_foodbank

@router.get("/foodbanks", response_model=List[schemas.FoodBank])
def get_foodbanks(
    district: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.FoodBank)
    
    if district:
        query = query.filter(models.FoodBank.district == district)
    
    return query.all()

@router.get("/foodbanks/{foodbank_id}", response_model=schemas.FoodBankWithInventory)
def get_foodbank(
    foodbank_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_foodbank = db.query(models.FoodBank).filter(models.FoodBank.id == foodbank_id).first()
    if not db_foodbank:
        raise HTTPException(status_code=404, detail="Foodbank not found")
    
    return db_foodbank

# Inventory Management
@router.get("/foodbanks/{foodbank_id}/inventory", response_model=List[schemas.InventoryItem])
def get_foodbank_inventory(
    foodbank_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check if foodbank exists
    db_foodbank = db.query(models.FoodBank).filter(models.FoodBank.id == foodbank_id).first()
    if not db_foodbank:
        raise HTTPException(status_code=404, detail="Foodbank not found")
    
    # If foodbank user, check if they are the admin
    if current_user.role == "foodbank" and db_foodbank.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this foodbank's inventory")
    
    inventory = db.query(models.InventoryItem).filter(models.InventoryItem.foodbank_id == foodbank_id).all()
    return inventory

@router.post("/foodbanks/{foodbank_id}/inventory", response_model=schemas.InventoryItem)
def add_inventory_item(
    foodbank_id: int,
    inventory_item: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check if foodbank exists
    db_foodbank = db.query(models.FoodBank).filter(models.FoodBank.id == foodbank_id).first()
    if not db_foodbank:
        raise HTTPException(status_code=404, detail="Foodbank not found")
    
    # Check authorization
    if current_user.role == "foodbank" and db_foodbank.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this foodbank's inventory")
    elif current_user.role == "user":
        raise HTTPException(status_code=403, detail="Regular users cannot modify inventory")
    
    # Check if food item exists
    db_food_item = db.query(models.FoodItem).filter(models.FoodItem.id == inventory_item.food_item_id).first()
    if not db_food_item:
        raise HTTPException(status_code=404, detail="Food item not found")
    
    # Check if item already exists in inventory
    existing_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.foodbank_id == foodbank_id,
        models.InventoryItem.food_item_id == inventory_item.food_item_id
    ).first()
    
    if existing_item:
        # Update quantity instead of creating new entry
        existing_item.quantity += inventory_item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    
    # Create new inventory item
    db_inventory_item = models.InventoryItem(
        foodbank_id=foodbank_id,
        food_item_id=inventory_item.food_item_id,
        quantity=inventory_item.quantity
    )
    db.add(db_inventory_item)
    db.commit()
    db.refresh(db_inventory_item)
    return db_inventory_item

@router.put("/foodbanks/{foodbank_id}/inventory/{item_id}", response_model=schemas.InventoryItem)
def update_inventory_item(
    foodbank_id: int,
    item_id: int,
    inventory_update: schemas.InventoryItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check if foodbank exists
    db_foodbank = db.query(models.FoodBank).filter(models.FoodBank.id == foodbank_id).first()
    if not db_foodbank:
        raise HTTPException(status_code=404, detail="Foodbank not found")
    
    # Check authorization
    if current_user.role == "foodbank" and db_foodbank.admin_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this foodbank's inventory")
    elif current_user.role == "user":
        raise HTTPException(status_code=403, detail="Regular users cannot modify inventory")
    
    # Check if inventory item exists
    db_inventory_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id,
        models.InventoryItem.foodbank_id == foodbank_id
    ).first()
    
    if not db_inventory_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Update inventory item
    db_inventory_item.quantity = inventory_update.quantity
    db.commit()
    db.refresh(db_inventory_item)
    return db_inventory_item