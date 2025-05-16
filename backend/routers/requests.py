from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

import models
import schemas
from database import get_db
from auth import get_current_active_user, get_current_foodbank_user, get_current_org_user

router = APIRouter(tags=["requests"])

@router.post("/requests", response_model=schemas.Request)
def create_request(
    request: schemas.RequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Create new request
    db_request = models.Request(
        user_id=current_user.id,
        location=request.location,
        district=request.district,
        latitude=request.latitude,
        longitude=request.longitude,
        status="Pending"
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    # Add request items
    for item in request.items:
        db_request_item = models.RequestItem(
            request_id=db_request.id,
            food_item_id=item.food_item_id,
            quantity=item.quantity
        )
        db.add(db_request_item)
    
    db.commit()
    db.refresh(db_request)
    return db_request

@router.get("/requests", response_model=List[schemas.Request])
def get_requests(
    status: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Regular users can only see their own requests
    if current_user.role == "user":
        query = db.query(models.Request).filter(models.Request.user_id == current_user.id)
    # Foodbank users can see requests assigned to them or unassigned in their district
    elif current_user.role == "foodbank":
        foodbank = db.query(models.FoodBank).filter(models.FoodBank.admin_id == current_user.id).first()
        if not foodbank:
            raise HTTPException(status_code=404, detail="Foodbank not found")
        
        query = db.query(models.Request).filter(
            (models.Request.assigned_to_id == foodbank.id) | 
            ((models.Request.status == "Pending") & (models.Request.district == foodbank.district))
        )
    # Org users can see all requests
    else:
        query = db.query(models.Request)
    
    # Apply filters if provided
    if status:
        query = query.filter(models.Request.status == status)
    if district:
        query = query.filter(models.Request.district == district)
    
    return query.order_by(models.Request.created_at.desc()).all()

@router.get("/requests/{request_id}", response_model=schemas.Request)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Regular users can only see their own requests
    if current_user.role == "user" and db_request.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this request")
    
    # Foodbank users can only see requests assigned to them or in their district
    if current_user.role == "foodbank":
        foodbank = db.query(models.FoodBank).filter(models.FoodBank.admin_id == current_user.id).first()
        if not foodbank:
            raise HTTPException(status_code=404, detail="Foodbank not found")
        
        if db_request.assigned_to_id != foodbank.id and (db_request.status != "Pending" or db_request.district != foodbank.district):
            raise HTTPException(status_code=403, detail="Not authorized to view this request")
    
    return db_request

@router.put("/requests/{request_id}", response_model=schemas.Request)
def update_request(
    request_id: int,
    request_update: schemas.RequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_request = db.query(models.Request).filter(models.Request.id == request_id).first()
    if not db_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Only org users can assign requests
    if request_update.assigned_to_id is not None and current_user.role != "org":
        raise HTTPException(status_code=403, detail="Only organization admins can assign requests")
    
    # Foodbank users can only update status of requests assigned to them
    if current_user.role == "foodbank":
        foodbank = db.query(models.FoodBank).filter(models.FoodBank.admin_id == current_user.id).first()
        if not foodbank:
            raise HTTPException(status_code=404, detail="Foodbank not found")
        
        if db_request.assigned_to_id != foodbank.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this request")
        
        # Foodbank users can only mark as fulfilled
        if request_update.status and request_update.status != "Fulfilled":
            raise HTTPException(status_code=403, detail="Foodbank users can only mark requests as fulfilled")
    
    # Update request fields
    if request_update.status:
        db_request.status = request_update.status
        if request_update.status == "Fulfilled":
            db_request.fulfilled_at = func.now()
    
    if request_update.assigned_to_id is not None:
        db_request.assigned_to_id = request_update.assigned_to_id
        if request_update.assigned_to_id > 0:  # Assigned to a foodbank
            db_request.status = "Assigned"
    
    db.commit()
    db.refresh(db_request)
    return db_request