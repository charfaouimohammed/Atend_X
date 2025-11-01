#model.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class TokenData(BaseModel):
    email: Optional[str] = None

class StudentBase(BaseModel):
    name: str
    cne: str
    email: str
    phone: str

class StudentCreate(StudentBase):
    image: str

class Student(StudentBase):
    id: str
    image: str
    registered_at: datetime
    embedding: List[float]

    class Config:
        from_attributes = True

class AdminBase(BaseModel):
    email: str

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: str
    disabled: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class StudentResponse(BaseModel):
    id: str
    name: str
    cne: str
    email: str
    phone: str
    image: Optional[str] = None

class SessionResponse(BaseModel):
    id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    admin_id: str
    present_students: List[StudentResponse]

class AttendanceStats(BaseModel):
    totalStudents: int
    todayPresent: int
    todayTotal: int
    todayAbsent: int
    attendanceRate: float
    recentSessions: List[dict]

class FaceMatch(BaseModel):
    student_id: str
    name: str
    cne: str
    confidence: float
    image: str

