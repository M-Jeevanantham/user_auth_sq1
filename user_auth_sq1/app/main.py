from fastapi import FastAPI, Depends, HTTPException, Response, logger, status, Cookie
from typing import Annotated
from pydantic import BaseModel, EmailStr, Field
from app.security import hash_password, verify_password
from app.database import get_db
from sqlalchemy import text
from app.jwt_handler import create_access_token, verify_access_token
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title = 'Authflow',
    version='1.0.0'
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
bearer_scheme = HTTPBearer()
class RegisterRequest(BaseModel):
    username:str = Field(..., min_length=3, max_length=50, description="Username must be between 3 and 50 characters long")
    email:EmailStr
    password:str = Field(...,description="Password must be between 8 and 20 characters long")
class LoginRequest(BaseModel):
    email:EmailStr
    password:str = Field(...,description="Password must be between 8 and 20 characters long")

@app.post("/api/login")
def userLogin(request: LoginRequest,response: Response, db: Annotated = Depends(get_db)):
    user = db.execute(
        text("SELECT * FROM user_table WHERE email = :email"),
        {"email": request.email}
    ).fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password_hash, request.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    access_token = create_access_token(user.id)
    response.set_cookie(key="access_token", 
                        value=access_token, 
                        httponly=True, 
                        max_age=30*60,
                        secure=False,
                        samesite="lax",
                        path="/")   
    return {
        "Message":"Login successful",
        "user_name": user.username
    }

def get_current_user(access_token: Annotated[str|None, Cookie()]=None, db: Annotated = Depends(get_db)):
    
    if not access_token:
        raise jwt.InvalidTokenError("Missing token")
    try:
        user_id = verify_access_token(access_token)
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f"Invalid token: {str(e)}")
    user = db.execute(
        text("SELECT * FROM user_table WHERE id = :id"),
        {"id": user_id}
    ).fetchone()
    if not user:
        raise jwt.InvalidTokenError("User not found")
    return user

@app.get("/api/profile")
def get_profile(current_user: Annotated = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at
    }

@app.post("/api/register")
def userRegister(request:RegisterRequest,db: Annotated = Depends(get_db)):
    hashed_password = hash_password(request.password)
    new_user = {
        "username": request.username,
        "email": request.email,
        "password": hashed_password
    }
    try:
        db.execute(
            text("INSERT INTO user_table (username, email, password_hash) VALUES (:username, :email, :password)"),
            new_user
        )
        db.commit()
    except Exception as e:
        db.rollback()
        logger.exception("Registration failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to register user"
        )
    return {
        "message": "User registered successfully",
        "username": request.username,
        "email": request.email,
        "password": hashed_password
        }

