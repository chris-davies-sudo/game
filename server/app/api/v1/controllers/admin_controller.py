# Standard imports
import logging

from typing import List

# Third-party imports
from fastapi import status, Depends, APIRouter

# Local imports
from app.models import PowerUp, Category, UserProfile
from app.exceptions import CustomAppException

router = APIRouter()
logger = logging.getLogger("__main__.admin_controller")


@router.post("/categories")
async def save_categories(categories: List[dict]):
    try: 
        category_objects = [Category(**cat) for cat in categories]
        Category.objects.insert(category_objects, load_bulk=False)
        return {"msg": "Categories saved successfully."}
    except Exception as e:
        logger.error(f"Auth endpoint error: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)
  

@router.post("/powerups")
async def save_powerup(powerups: List[dict]):
    try: 
        powerup_objects = [PowerUp(**pu) for pu in powerups]
        PowerUp.objects.insert(powerup_objects, load_bulk=False)
        return {"msg": "Power-ups saved successfully."}
    except Exception as e:
        logger.error(f"Auth endpoint error: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/create-profile")
async def create_profile(profile: dict):
    try:
        user_profile = UserProfile(**profile)
        user_profile.save()
        return {"msg": "User profile created successfully."}
    except Exception as e:
        logger.error(f"Profile creation error: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)
