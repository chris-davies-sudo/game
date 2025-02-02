# Standard imports
import logging

# Third-party imports
from fastapi import status, Depends, APIRouter

# Local imports
from app.exceptions import CustomAppException

router = APIRouter()
logger = logging.getLogger("__main__.admin_controller")

@router.get("")
async def admin():
    try: 
        return {"msg": "Okay Admin"}
    except Exception as e:
        logger.error(f"Auth endpoint error: {str(e)}")
        raise CustomAppException("InternalError", 'An unexpected error occurred. Please try again later.', status.HTTP_500_INTERNAL_SERVER_ERROR)
   