# Standard imports
import logging

from contextlib import asynccontextmanager

# Third-party imports
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Local imports
from app.core import settings
from app.api import api_router_v1
from app.exceptions import CustomAppException
from app.schemas import ValidationError, ErrorResponse #TODO: Fix the error schemas 


# Setup logger
@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.log_settings()
    yield

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Planner Service",
    description="This is the planner server which connects to and retrieves information from Smartsheet.",
    version="1.0.0",
)

security = HTTPBearer()

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
    return {"message": "Hello From The Planner Service!"}


app.include_router(api_router_v1, prefix="/api/v1")