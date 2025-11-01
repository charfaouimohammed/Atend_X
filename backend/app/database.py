# # app/database.py
# from pymongo import MongoClient
# from bson import ObjectId
# from fastapi import HTTPException
# import os
# from dotenv import load_dotenv

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
# DATABASE_NAME = os.getenv("DATABASE_NAME", "attendance_system")

# client = MongoClient(MONGO_URI)
# db = client[DATABASE_NAME]

# students_collection = db["students"]
# admins_collection = db["admins"]
# sessions_collection = db["sessions"]

# def get_student_by_id(student_id: str):
#     try:
#         student = students_collection.find_one({"_id": ObjectId(student_id)})
#         if student:
#             student["id"] = str(student["_id"])
#             return student
#         return None
#     except:
#         raise HTTPException(status_code=400, detail="Invalid student ID")

# def get_admin_by_email(email: str):
#     admin = admins_collection.find_one({"email": email})
#     if admin:
#         admin["id"] = str(admin["_id"])
#         return admin
#     return None