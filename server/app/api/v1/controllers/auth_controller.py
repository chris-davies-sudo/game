import logging
from datetime import datetime, timedelta

from jose import jwt
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, status

from models import UserProfile
from exceptions import CustomAppException

# JWT settings
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

router = APIRouter()
logger = logging.getLogger("__main__.auth_controller")

class LoginRequest(BaseModel):
    username: str
    password: str

# Function to create JWT token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/login")
async def login(payload: LoginRequest):
    try:
        user = UserProfile.objects(username=payload.username).first()
        if not user or user.password_hash != payload.password:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        # Generate JWT token
        access_token = create_access_token({"sub": user.username})
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        logger.error(f"Auth endpoint error: {str(e)}")
        raise CustomAppException("InternalError", "An unexpected error occurred. Please try again later.", status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/profile/status")
async def check_profile_status():
    """Check if a user's profile is active"""
    try:
        user = UserProfile.objects(username='beautiful').first()
        
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        return {"active": user.active}

    except Exception as e:
        logger.error(f"Profile status check error: {str(e)}")
        raise CustomAppException("InternalError", "An unexpected error occurred. Please try again later.", status.HTTP_500_INTERNAL_SERVER_ERROR)
