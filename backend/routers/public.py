from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db

router = APIRouter(tags=["public"])

@router.get("/public/foodbanks", response_model=List[schemas.FoodBank])
def get_public_foodbanks(
    district: str = None,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to get a list of foodbanks without authentication.
    Can be filtered by district.
    """
    query = db.query(models.FoodBank)
    
    if district:
        query = query.filter(models.FoodBank.district == district)
    
    return query.all()

@router.get("/public/districts", response_model=List[schemas.District])
def get_public_districts(
    db: Session = Depends(get_db)
):
    """
    Public endpoint to get a list of districts without authentication.
    """
    return db.query(models.District).all()

@router.get("/public/food-items", response_model=List[schemas.FoodItem])
def get_public_food_items(
    db: Session = Depends(get_db)
):
    """
    Public endpoint to get a list of food items without authentication.
    """
    return db.query(models.FoodItem).all()

@router.post("/public/requests", status_code=status.HTTP_201_CREATED)
def create_public_request(
    request_data: dict,
    db: Session = Depends(get_db)
):
    """
    Endpoint for creating anonymous food aid requests without authentication.
    Takes the requester's personal details and item requests.
    """
    try:
        # First, create or get user (based on IC number)
        ic_number = request_data.get("ic_number")
        if not ic_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="IC number is required"
            )
            
        # Check if user with this IC exists
        user = db.query(models.User).filter(models.User.username == f"guest_{ic_number}").first()
        
        if not user:
            # Create new user with basic info
            user = models.User(
                username=f"guest_{ic_number}",
                email=f"guest_{ic_number}@example.com",  # placeholder email
                hashed_password="",  # no password for guest users
                role="user",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Create the request
        new_request = models.Request(
            user_id=user.id,
            location=request_data.get("address", ""),
            district=request_data.get("district", ""),
            latitude=request_data.get("latitude", 0),
            longitude=request_data.get("longitude", 0),
            status="Pending"
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        
        # Add request items
        for item in request_data.get("items", []):
            request_item = models.RequestItem(
                request_id=new_request.id,
                food_item_id=item.get("food_item_id"),
                quantity=item.get("quantity", 1)
            )
            db.add(request_item)
        
        db.commit()
        
        return {
            "status": "success", 
            "message": "Request created successfully", 
            "request_id": new_request.id,
            "tracking_number": new_request.tracking_number
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating request: {str(e)}"
        )

@router.get("/public/track/{tracking_number}")
def track_request(
    tracking_number: str,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to track a request by its tracking number.
    Returns basic status information without sensitive details.
    """
    request = db.query(models.Request).filter(models.Request.tracking_number == tracking_number).first()
    
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found"
        )
    
    # Get food items for this request
    request_items = []
    for item in request.request_items:
        request_items.append({
            "name": item.food_item.name,
            "quantity": item.quantity
        })
    
    # Get foodbank info if assigned
    foodbank_info = None
    if request.assigned_to_id:
        foodbank = db.query(models.FoodBank).filter(models.FoodBank.id == request.assigned_to_id).first()
        if foodbank:
            foodbank_info = {
                "name": foodbank.name,
                "location": foodbank.location,
                "contact_info": foodbank.contact_info
            }
    
    return {
        "tracking_number": request.tracking_number,
        "status": request.status,
        "created_at": request.created_at,
        "fulfilled_at": request.fulfilled_at,
        "items": request_items,
        "foodbank": foodbank_info
    }