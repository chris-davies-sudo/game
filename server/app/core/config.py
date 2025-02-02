# Standard imports
import logging

# Third-party imports
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    appinsinstkey: str = 'dddd'
