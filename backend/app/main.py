import logging
from fastapi import FastAPI, Depends, HTTPException, status, Form, UploadFile, File, Request, Body
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import List, Optional
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from deepface import DeepFace
from bson import ObjectId
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from pymongo import MongoClient

from .models import (
    StudentCreate,
    Student,
    AdminCreate,
    Admin,
    Token,
    StudentResponse,
    SessionResponse,
    AttendanceStats,
    FaceMatch
)

app = FastAPI()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# JWT Configuration
SECRET_KEY = "your-secret-key-here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database setup
client = MongoClient("mongodb://localhost:27017/")
db = client["attendance_system"]
students_collection = db["students"]
admins_collection = db["admins"]
sessions_collection = db["sessions"]

# CORS configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utility functions
def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_admin(email: str, password: str):
    admin = admins_collection.find_one({"email": email})
    if not admin:
        return False
    if not verify_password(password, admin["password"]):
        return False
    return admin

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_admin(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    admin = admins_collection.find_one({"email": email})
    if admin is None:
        raise credentials_exception
    return admin

async def get_current_active_admin(current_admin: Admin = Depends(get_current_admin)):
    if current_admin.get("disabled"):
        raise HTTPException(status_code=400, detail="Inactive admin")
    return current_admin

# Student endpoints
@app.post("/students/", response_model=Student)
async def add_student(
    name: str = Form(...),
    cne: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_active_admin)
):
    try:
        image_bytes = await file.read()
        base64_image = base64.b64encode(image_bytes).decode("utf-8")

        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)
        
        embedding_obj = DeepFace.represent(
            img_path=img_array,
            model_name='Facenet512',
            detector_backend='opencv',
            enforce_detection=True,
            align=True
        )
        
        embedding = embedding_obj[0]['embedding']

        student_doc = {
            "name": name,
            "cne": cne,
            "email": email,
            "phone": phone,
            "image": base64_image,
            "embedding": embedding,
            "registered_at": datetime.now(),
            "created_by": str(current_admin["_id"])
        }

        result = students_collection.insert_one(student_doc)
        student = students_collection.find_one({"_id": result.inserted_id})
        student["id"] = str(student["_id"])
        return student

    except Exception as e:
        logging.error(f"Error creating student: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Student creation failed: {str(e)}"
        )

@app.get("/students/", response_model=List[StudentResponse])
async def get_students(current_admin: Admin = Depends(get_current_active_admin)):
    try:
        students = []
        for student in students_collection.find():
            student["id"] = str(student["_id"])
            students.append(student)
        return students
    except Exception as e:
        logging.error(f"Error fetching students: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch students")

@app.get("/students/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: str, 
    current_admin: Admin = Depends(get_current_active_admin)
):
    try:
        # Validate student_id
        if not student_id or student_id.lower() == "undefined":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Student ID is required"
            )
        
        if not ObjectId.is_valid(student_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid student ID format"
            )

        student = students_collection.find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
        
        student["id"] = str(student["_id"])
        return student
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching student: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    admin = authenticate_admin(form_data.username, form_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin["email"], "id": str(admin["_id"])},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=Admin)
async def register_admin(admin: AdminCreate):
    existing_admin = admins_collection.find_one({"email": admin.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(admin.password)
    admin_dict = admin.dict()
    admin_dict.update({
        "password": hashed_password,
        "role": "admin",
        "disabled": False,
        "created_at": datetime.now()
    })
    
    result = admins_collection.insert_one(admin_dict)
    new_admin = admins_collection.find_one({"_id": result.inserted_id})
    new_admin["id"] = str(new_admin["_id"])
    return new_admin


# Add these endpoints to your FastAPI app

@app.get("/attendance/stats", response_model=AttendanceStats)
async def get_attendance_stats(current_admin: Admin = Depends(get_current_active_admin)):
    try:
        total_students = students_collection.count_documents({})
        
        today = datetime.now().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        today_sessions = list(sessions_collection.find({
            "start_time": {"$gte": start_of_day, "$lte": end_of_day},
            "status": "completed",
            "admin_id": str(current_admin["_id"])
        }))
        
        today_present = sum(len(session.get("present_students", [])) for session in today_sessions)
        today_total = total_students * len(today_sessions) if today_sessions else 0
        
        recent_sessions = list(sessions_collection.find(
            {"admin_id": str(current_admin["_id"]), "status": "completed"}
        ).sort("start_time", -1).limit(5))
        
        return {
            "totalStudents": total_students,
            "todayPresent": today_present,
            "todayTotal": today_total,
            "todayAbsent": today_total - today_present if today_total > 0 else 0,
            "attendanceRate": today_present / today_total if today_total > 0 else 0,
            "recentSessions": [
                {
                    "id": str(session["_id"]),
                    "date": session["start_time"],
                    "presentCount": len(session.get("present_students", [])),
                    "absentCount": total_students - len(session.get("present_students", []))
                }
                for session in recent_sessions
            ]
        }
    except Exception as e:
        logging.error(f"Error fetching stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching stats: {str(e)}"
        )

@app.get("/sessions/current", response_model=Optional[SessionResponse])
async def get_current_session(current_admin: Admin = Depends(get_current_active_admin)):
    try:
        session = sessions_collection.find_one({
            "admin_id": str(current_admin["_id"]),
            "status": "active"
        })
        
        if not session:
            return None

        present_students = []
        for student_id in session.get("present_students", []):
            student = students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                present_students.append({
                    "id": str(student["_id"]),
                    "name": student["name"],
                    "cne": student["cne"],
                    "email": student["email"],
                    "phone": student["phone"],
                    "image": student.get("image")
                })
        
        return {
            "id": str(session["_id"]),
            "start_time": session["start_time"],
            "status": session["status"],
            "admin_id": session["admin_id"],
            "present_students": present_students
        }
    except Exception as e:
        logging.error(f"Error getting current session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve current session"
        )

@app.post("/sessions/start", response_model=SessionResponse)
async def start_attendance_session(current_admin: Admin = Depends(get_current_active_admin)):
    try:
        existing_session = sessions_collection.find_one({
            "admin_id": str(current_admin["_id"]),
            "status": "active"
        })
        
        if existing_session:
            raise HTTPException(
                status_code=400,
                detail="You already have an active session"
            )

        session_data = {
            "start_time": datetime.now(),
            "admin_id": str(current_admin["_id"]),
            "status": "active",
            "present_students": []
        }
        
        result = sessions_collection.insert_one(session_data)
        session = sessions_collection.find_one({"_id": result.inserted_id})
        
        return {
            "id": str(session["_id"]),
            "start_time": session["start_time"],
            "status": session["status"],
            "admin_id": session["admin_id"],
            "present_students": []
        }
    except Exception as e:
        logging.error(f"Error starting session: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@app.post("/recognize", response_model=List[FaceMatch])
async def recognize_face(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_active_admin)
):
    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(image)
        
        embedding = DeepFace.represent(
            img_array, 
            model_name='Facenet512', 
            enforce_detection=False
        )[0]['embedding']
        
        matches = []
        for student in students_collection.find():
            try:
                result = DeepFace.verify(
                    embedding,
                    student['embedding'],
                    model_name='Facenet512',
                    distance_metric='cosine',
                    enforce_detection=False
                )
                
                if result['distance'] < 0.55:
                    matches.append({
                        "student_id": str(student["_id"]),
                        "name": student["name"],
                        "cne": student["cne"],
                        "confidence": 1 - result['distance'],
                        "image": student["image"]
                    })
            except Exception as e:
                continue
        
        return sorted(matches, key=lambda x: x["confidence"], reverse=True)
            
    except Exception as e:
        logging.error(f"Face recognition failed: {str(e)}")
        raise HTTPException(
            status_code=400, 
            detail=f"Face recognition failed: {str(e)}"
        )

@app.post("/sessions/{session_id}/mark-attendance")
async def mark_attendance(
    session_id: str,
    student_id: str = Body(..., embed=True),
    current_admin: Admin = Depends(get_current_active_admin)
):
    try:
        # Validate IDs
        if not ObjectId.is_valid(session_id):
            raise HTTPException(400, "Invalid session ID format")
        if not ObjectId.is_valid(student_id):
            raise HTTPException(400, "Invalid student ID format")
        # Convert to ObjectId
        session_oid = ObjectId(session_id)
        student_oid = ObjectId(student_id)
        # Check session exists and belongs to admin
        session = sessions_collection.find_one({
            "_id": session_oid,
            "admin_id": str(current_admin["_id"])
        })
        if not session:
            raise HTTPException(404, "Session not found or not authorized")
        # Check student exists
        if not students_collection.find_one({"_id": student_oid}):
            raise HTTPException(404, "Student not found")
        # Update attendance
        result = sessions_collection.update_one(
            {"_id": session_oid},
            {"$addToSet": {"present_students": student_id}}
        )
        if result.modified_count == 0:
            return JSONResponse(
                status_code=200,
                content={"message": "Student already marked present"}
            )
        return {"message": "Attendance marked successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking attendance: {str(e)}")
        raise HTTPException(500, "Internal server error")

@app.post("/sessions/{session_id}/end", response_model=SessionResponse)
async def end_session(
    session_id: str,
    current_admin: Admin = Depends(get_current_active_admin)
):
    try:
        # Validate session ID
        if not ObjectId.is_valid(session_id):
            raise HTTPException(status_code=400, detail="Invalid session ID format")
        
        # Check session exists and belongs to admin
        session = sessions_collection.find_one({
            "_id": ObjectId(session_id),
            "admin_id": str(current_admin["_id"])
        })
        if not session:
            raise HTTPException(status_code=404, detail="Session not found or not authorized")

        # Update session
        update_data = {
            "status": "completed",
            "end_time": datetime.now()
        }
        
        update_result = sessions_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": update_data}
        )

        if update_result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Failed to update session")

        # Fetch updated session with proper present_students format
        updated_session = sessions_collection.find_one({"_id": ObjectId(session_id)})
        
        # Ensure present_students is properly formatted
        present_students = []
        for student_id in updated_session.get("present_students", []):
            student = students_collection.find_one({"_id": ObjectId(student_id)})
            if student:
                present_students.append({
                    "id": str(student["_id"]),
                    "name": student["name"],
                    "cne": student["cne"],
                    "email": student["email"],
                    "phone": student["phone"]
                })

        return {
            "id": str(updated_session["_id"]),
            "start_time": updated_session["start_time"],
            "end_time": updated_session.get("end_time"),
            "status": updated_session["status"],
            "admin_id": updated_session["admin_id"],
            "present_students": present_students  # Now properly formatted
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending session: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to end session")

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return {"message": "Attendance System API"}

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)