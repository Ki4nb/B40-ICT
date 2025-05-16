from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from auth import get_current_org_user

router = APIRouter(tags=["organization"])

@router.get("/stats/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_org_user)
):
    # Get counts of requests by status
    total_requests = db.query(func.count(models.Request.id)).scalar()
    pending_requests = db.query(func.count(models.Request.id)).filter(models.Request.status == "Pending").scalar()
    assigned_requests = db.query(func.count(models.Request.id)).filter(models.Request.status == "Assigned").scalar()
    fulfilled_requests = db.query(func.count(models.Request.id)).filter(models.Request.status == "Fulfilled").scalar()
    
    # Get district stats
    district_stats = []
    districts = db.query(models.District).all()
    
    for district in districts:
        district_total = db.query(func.count(models.Request.id)).filter(models.Request.district == district.name).scalar()
        district_pending = db.query(func.count(models.Request.id)).filter(
            models.Request.district == district.name,
            models.Request.status == "Pending"
        ).scalar()
        district_assigned = db.query(func.count(models.Request.id)).filter(
            models.Request.district == district.name,
            models.Request.status == "Assigned"
        ).scalar()
        district_fulfilled = db.query(func.count(models.Request.id)).filter(
            models.Request.district == district.name,
            models.Request.status == "Fulfilled"
        ).scalar()
        
        district_stats.append(schemas.DistrictStats(
            district=district.name,
            total_requests=district_total,
            pending_requests=district_pending,
            assigned_requests=district_assigned,
            fulfilled_requests=district_fulfilled
        ))
    
    # Get inventory stats
    inventory_stats = []
    food_items = db.query(models.FoodItem).all()
    
    for food_item in food_items:
        total_quantity = db.query(func.sum(models.InventoryItem.quantity)).filter(
            models.InventoryItem.food_item_id == food_item.id
        ).scalar() or 0
        
        foodbank_quantities = {}
        foodbank_inventory = db.query(
            models.FoodBank.name, 
            models.InventoryItem.quantity
        ).join(
            models.InventoryItem, 
            models.FoodBank.id == models.InventoryItem.foodbank_id
        ).filter(
            models.InventoryItem.food_item_id == food_item.id
        ).all()
        
        for foodbank_name, quantity in foodbank_inventory:
            foodbank_quantities[foodbank_name] = quantity
        
        inventory_stats.append(schemas.InventoryStats(
            food_item=food_item.name,
            total_quantity=total_quantity,
            foodbanks=foodbank_quantities
        ))
    
    return schemas.DashboardStats(
        total_requests=total_requests,
        pending_requests=pending_requests,
        assigned_requests=assigned_requests,
        fulfilled_requests=fulfilled_requests,
        district_stats=district_stats,
        inventory_stats=inventory_stats
    )

@router.get("/districts", response_model=List[schemas.District])
def get_districts(
    db: Session = Depends(get_db)
):
    # Removed authentication requirement
    return db.query(models.District).all()

@router.post("/districts", response_model=schemas.District)
def create_district(
    district: schemas.DistrictCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_org_user)
):
    # Check if district already exists
    db_district = db.query(models.District).filter(models.District.name == district.name).first()
    if db_district:
        raise HTTPException(status_code=400, detail="District already exists")
    
    # Create new district
    db_district = models.District(
        name=district.name,
        state=district.state,
        geojson=district.geojson
    )
    db.add(db_district)
    db.commit()
    db.refresh(db_district)
    return db_district

@router.get("/districts/{district_id}", response_model=schemas.District)
def get_district(
    district_id: int,
    db: Session = Depends(get_db)
):
    # Removed authentication requirement
    db_district = db.query(models.District).filter(models.District.id == district_id).first()
    if not db_district:
        raise HTTPException(status_code=404, detail="District not found")
    
    return db_district

@router.get("/food-items", response_model=List[schemas.FoodItem])
def get_food_items(
    db: Session = Depends(get_db)
):
    # This endpoint has always been public
    return db.query(models.FoodItem).all()

@router.post("/food-items", response_model=schemas.FoodItem)
def create_food_item(
    food_item: schemas.FoodItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_org_user)
):
    # Check if food item already exists
    db_food_item = db.query(models.FoodItem).filter(models.FoodItem.name == food_item.name).first()
    if db_food_item:
        raise HTTPException(status_code=400, detail="Food item already exists")
    
    # Create new food item
    db_food_item = models.FoodItem(
        name=food_item.name,
        icon=food_item.icon,
        category=food_item.category
    )
    db.add(db_food_item)
    db.commit()
    db.refresh(db_food_item)
    return db_food_item