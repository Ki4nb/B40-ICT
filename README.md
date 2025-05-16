# B40 Food Aid Management Platform

A full-stack web platform designed to support food assistance coordination for Malaysia's B40 (Bottom 40%) community. The platform helps users request food aid, food banks manage inventory, and NGOs oversee fulfillment. Built with **React + Tailwind CSS** for the frontend and **FastAPI + SQLite** for the backend.

## 📦 Features

### 👥 Roles
- **User**: Submits food requests via a simple multilingual, icon-based interface without registration
- **Food Bank**: Manages inventory, views/accepts requests.
- **Organization**: Oversees all requests, assigns them to food banks, analyzes regional needs.

### 🔧 Core Functionalities
- Submit request (with basic form + icon categories)
- View and manage inventory (real-time)
- Approve/assign requests (Org → Food Bank or Food Bank direct)
- Dashboard with district-level request analytics
- SQLite database for simple deployment
- Map-based view of requests

## 🧱 Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: FastAPI
- **Database**: SQLite
- **Auth**: Simple JWT-based authentication (no email/SMS confirmation)
- **Map**: Leaflet.js with mock GeoJSON data

## 🗂 Directory Structure
```
frontend/
  └── src/
      ├── components/
      ├── pages/
      ├── icons/ (SVGs for non-literate UI)
      └── App.tsx
backend/
  ├── main.py
  ├── models.py
  ├── database.py
  ├── routers/
  │   ├── auth.py
  │   ├── requests.py
  │   ├── foodbank.py
  │   └── organization.py
  └── seed_data.py
```

## 🧪 Quick Setup

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py  # Initialize database with test data
uvicorn main:app --reload
```

## 🔐 Authentication

### Test Accounts
The system comes with pre-configured test accounts:

1. **Organization Admin**
   - Username: `orgadmin`
   - Password: `password`
   - Role: Organization

2. **Food Bank 1**
   - Username: `foodbank1`
   - Password: `password`
   - Role: Food Bank

3. **Food Bank 2**
   - Username: `foodbank2`
   - Password: `password`
   - Role: Food Bank

4. **Regular User**
   - Username: `user1`
   - Password: `password`
   - Role: User

## 🚀 API Documentation

When the backend is running, you can access the Swagger UI API documentation at:
http://localhost:8000/docs

## 🖼 UI Guidelines
- Uses **icon buttons** for food types (with alt text)
- Avoids text-heavy components
- Responsive for mobile-first use
- Clear color-based request status (e.g. red = unassigned, green = fulfilled)

## Future Improvements
- Multi-language support (BM, English)
- Real-time notification system
- Upload request via photo
