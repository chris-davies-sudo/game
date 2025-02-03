# Standard imports
import logging

# Third-party imports
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Local imports
from app.core import init_mongo
from app.api import api_router_v1
from app.exceptions import CustomAppException
#from app.schemas import ValidationError, ErrorResponse #TODO: Fix the error schemas 

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Game Service",
    description="This is the game server.",
    version="1.0.0",
)

# Initialize MongoDB Connection
init_mongo()

#Middleware
@app.exception_handler(CustomAppException)
async def custom_app_exception_handler(request: Request, exc: CustomAppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"msg": "error", "data": {"type": exc.name, "detail": exc.description}}
    )

@app.exception_handler(StarletteHTTPException)
@app.exception_handler(RequestValidationError)
async def http_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=exc.status_code if isinstance(exc, StarletteHTTPException) else 422,
        content={"detail": str(exc.detail) if isinstance(exc, StarletteHTTPException) else exc.errors()},
    )


# CORS middleware TODO: Update with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routes
@app.get("/health", include_in_schema=False)
async def root():
    return {"message": "Hello From The Game Service!"}

app.include_router(api_router_v1, prefix="/api/v1")