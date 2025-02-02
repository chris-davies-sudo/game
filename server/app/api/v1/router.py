# Third-party imports
from fastapi import APIRouter

# Local imports
from .controllers import auth_controller, game_controller, admin_controller

api_router_v1 = APIRouter()

api_router_v1.include_router(auth_controller.router, prefix="/auth", tags=["auth-endpoints"])
api_router_v1.include_router(game_controller.router, prefix="/game", tags=["game-endpoints"])
api_router_v1.include_router(admin_controller.router, prefix="/admin", tags=["admin-endpoints"])