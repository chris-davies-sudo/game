# Standard imports
import logging

from bson import ObjectId
from typing import Optional

# Third-party imports
from fastapi import status, APIRouter

# Local imports
from app.exceptions import CustomAppException
from app.models import PowerUp, Category, UserEvent, UserProfile

router = APIRouter()
logger = logging.getLogger("__main__.game_controller")

def serialize_document(doc):
    """ Convert MongoEngine document to JSON-compatible dictionary """
    doc_dict = doc.to_mongo().to_dict()
    doc_dict["_id"] = str(doc_dict["_id"])  # Convert ObjectId to string
    if "user" in doc_dict and isinstance(doc_dict["user"], ObjectId):
        doc_dict["user"] = str(doc_dict["user"])
    if "category" in doc_dict and isinstance(doc_dict["category"], ObjectId):
        doc_dict["category"] = str(doc_dict["category"])
    if "powerup" in doc_dict and isinstance(doc_dict["powerup"], ObjectId):
        doc_dict["powerup"] = str(doc_dict["powerup"])
    return doc_dict


@router.get("/categories")
async def get_categories():
    try:
        categories = Category.objects().all()
        return {"data": [serialize_document(cat) for cat in categories]}
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/powerups")
async def get_powerups():
    try:
        powerups = PowerUp.objects().all()
        return {"data": [serialize_document(pu) for pu in powerups]}
    except Exception as e:
        logger.error(f"Error fetching power-ups: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/profile/{username}")
async def get_user_profile(username: str):
    try:
        user = UserProfile.objects(username=username).first()
        return serialize_document(user)
    except Exception as e:
        logger.error(f"Error fetching user profile: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)

@router.post("/purchase-powerup")
async def purchase_powerup(username: str, powerup_id: str):
    try:
        user = UserProfile.objects(username=username).first()
        powerup = PowerUp.objects(id=powerup_id).first()
        
        if not user:
            raise CustomAppException("UserError", 'User not found.', status.HTTP_404_NOT_FOUND)
        if not powerup:
            raise CustomAppException("UserError", 'Power-up not found.', status.HTTP_404_NOT_FOUND)
        if powerup.taken:
            raise CustomAppException("UserError", 'Power-up already taken.', status.HTTP_400_BAD_REQUEST)
        if user.points < powerup.cost:
            raise CustomAppException("UserError", 'Not enough points.', status.HTTP_400_BAD_REQUEST)
        
        # Deduct points and mark power-up as taken
        user.points -= powerup.cost
        user.save()
        powerup.taken = True
        powerup.save()
        
        return {"msg": "Power-up purchased successfully."}
    except Exception as e:
        logger.error(f"Error purchasing power-up: {str(e)}")
        raise e
    

@router.get("/user-events")
async def get_user_events():
    """Fetch all events related to a user."""
    try:
        events = UserEvent.objects().all()
        event_data = []
        for event in events:
            event_dict = serialize_document(event)
            if event.category:
                event_dict["category_name"] = event.category.name
                event_dict["category_type"] = event.category.type
            if event.powerup:
                event_dict["powerup_name"] = event.powerup.name
                event_dict["powerup_type"] = event.powerup.type
            event_data.append(event_dict)
        
        return {"data": event_data}
    except Exception as e:
        logger.error(f"Error fetching user events: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/user-events")
async def log_user_event(username: str, event_type: str, category_id: Optional[str] = None, powerup_id: Optional[str] = None, points_earned: int = 0):
    """Log a user event (spins or power-up purchases)."""
    try:
        user = UserProfile.objects(username=username).first()
        category = Category.objects(id=category_id).first() if category_id else None
        powerup = PowerUp.objects(id=powerup_id).first() if powerup_id else None
        
        user_event = UserEvent(
            user=user,
            event_type=event_type,
            category=category,
            powerup=powerup,
            points_earned=points_earned
        )
        user_event.save()
        
        return {"msg": "User event logged successfully."}
    except Exception as e:
        logger.error(f"Error logging user event: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)




# Add present to categories
# X events until present 
# Update category if present is used convert to something else 
# Add get random power up, loss random power up
# Add get x point amounts, loss x points
# Add image url to categories and power ups
# colour code to category model
# Add login/logout
# Protect routes  