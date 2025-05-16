from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
from database import engine, get_db
from routers import auth, requests, foodbank, organization, public, users

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="B40 Food Aid Management Platform",
    description="API for managing food aid requests and inventory",
    version="1.0.0"
)

# CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(requests.router, prefix="/api")
app.include_router(foodbank.router, prefix="/api")
app.include_router(organization.router, prefix="/api")
app.include_router(public.router, prefix="/api")  # Added public router
app.include_router(users.router, prefix="/api")  # Added users router

@app.get("/")
def root():
    return {"message": "Welcome to B40 Food Aid Management Platform API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}