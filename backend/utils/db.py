from pymongo import MongoClient
from urllib.parse import quote_plus
from config import MONGO_URI, DB_NAME
import re

# Global variables for lazy connection
_client = None
_db = None

def encode_mongo_uri(uri):
    """
    Properly encode MongoDB URI if username/password contain special characters.
    Handles both mongodb:// and mongodb+srv:// formats.
    """
    try:
        # Pattern to match: protocol://username:password@host/path
        pattern = r'(mongodb\+?srv?://)([^:]+):([^@]+)@(.+)'
        match = re.match(pattern, uri)
        
        if match:
            protocol = match.group(1)
            username = match.group(2)
            password = match.group(3)
            rest = match.group(4)
            
            # URL encode username and password (handles special characters)
            encoded_username = quote_plus(username)
            encoded_password = quote_plus(password)
            
            # Reconstruct URI
            encoded_uri = f"{protocol}{encoded_username}:{encoded_password}@{rest}"
            return encoded_uri
        else:
            # If no match, try to use as-is (might already be encoded or have different format)
            return uri
    except Exception:
        # If encoding fails, return original URI
        return uri

def get_db():
    """
    Lazy connection to MongoDB. Connects only when first accessed.
    Returns the database instance.
    """
    global _client, _db
    
    if _db is not None:
        return _db
    
    # Validate connection string format
    if not MONGO_URI or MONGO_URI == "YOUR_MONGODB_ATLAS_CONNECTION_STRING":
        raise ValueError(
            "MONGO_URI is not set! Please add your MongoDB connection string to .env file.\n"
            "Format: MONGO_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/"
        )
    
    # Check if connection string looks valid
    if "cluster.mongodb.net" in MONGO_URI and "cluster" not in MONGO_URI.split("@")[-1].split(".")[0]:
        print("⚠️  Warning: Your connection string might be using a placeholder.")
        print("   Make sure you replace 'cluster' with your actual MongoDB Atlas cluster name.")
    
    # Encode the URI to handle special characters in username/password
    encoded_uri = encode_mongo_uri(MONGO_URI)
    
    try:
        # Connect to MongoDB (lazy connection)
        _client = MongoClient(encoded_uri, serverSelectionTimeoutMS=5000)
        _db = _client[DB_NAME]
        
        # Test connection
        _client.server_info()
        
        return _db
    except Exception as e:
        error_msg = str(e)
        print("\n" + "=" * 60)
        print("❌ MongoDB Connection Failed!")
        print("=" * 60)
        print(f"Error: {error_msg}\n")
        print("🔍 Troubleshooting:")
        print("   1. Check your .env file has MONGO_URI set correctly")
        print("   2. Verify your MongoDB Atlas cluster name (not 'cluster')")
        print("   3. Check your username and password are correct")
        print("   4. Ensure IP whitelist includes 0.0.0.0/0 (or your IP)")
        print("   5. Verify network connectivity")
        print("\n📝 Connection string format:")
        print("   MONGO_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/")
        print("=" * 60 + "\n")
        raise

# For backward compatibility, create db object that connects on first access
class LazyDB:
    def __getattr__(self, name):
        db_instance = get_db()
        attr = getattr(db_instance, name)
        # If it's a collection, return it wrapped
        if hasattr(attr, 'find_one'):
            return attr
        return attr
    
    def __getitem__(self, name):
        return get_db()[name]

db = LazyDB()

