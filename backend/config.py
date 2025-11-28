import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "YOUR_MONGODB_ATLAS_CONNECTION_STRING")
DB_NAME = "medaware"

