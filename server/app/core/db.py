import logging

from mongoengine import connect

# Logger setup
logger = logging.getLogger("mongo_connection")

def init_mongo():
    try:
        mongo_uri = "mongodb+srv://chrisjdavies96:fVD0AtprWslxshOI@cluster0.lnfpa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        connect(db="spinning_wheel_db", host=mongo_uri, alias="default")
        logger.info("Connected to MongoDB successfully.")
    except Exception as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        raise