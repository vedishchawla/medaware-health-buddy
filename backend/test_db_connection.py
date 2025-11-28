"""
Quick MongoDB Connection Test Script
Run this to verify your MongoDB connection is working.
"""

from utils.db import db
from config import MONGO_URI

def test_connection():
    print("=" * 50)
    print("MongoDB Connection Test")
    print("=" * 50)
    
    # Show connection string (first 30 chars only for security)
    print(f"\n📡 Connection String: {MONGO_URI[:30]}...")
    print(f"📊 Database Name: {db.name}")
    
    try:
        # Test connection with ping
        result = db.command('ping')
        print("\n✅ MongoDB connection successful!")
        print(f"   Ping response: {result}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"\n📁 Collections in database: {collections if collections else 'None (empty database)'}")
        
        # Test write (optional - creates a test document)
        print("\n🧪 Testing write operation...")
        test_doc = {
            "test": True,
            "timestamp": "connection_test"
        }
        result = db.test_connection.insert_one(test_doc)
        print(f"   ✅ Write test successful! Document ID: {result.inserted_id}")
        
        # Clean up test document
        db.test_connection.delete_one({"_id": result.inserted_id})
        print("   🧹 Test document cleaned up")
        
        print("\n" + "=" * 50)
        print("✅ All tests passed! MongoDB is ready to use.")
        print("=" * 50)
        return True
        
    except Exception as e:
        print(f"\n❌ MongoDB connection failed!")
        print(f"   Error: {str(e)}")
        print("\n🔍 Troubleshooting:")
        print("   1. Check your MONGO_URI in .env file")
        print("   2. If password contains special characters (@, :, /, #, etc.),")
        print("      URL-encode them or the code will auto-encode")
        print("   3. Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0")
        print("   4. Check your internet connection")
        print("   5. Verify database user credentials")
        print("\n💡 Common special characters that need encoding:")
        print("   @ → %40, : → %3A, / → %2F, # → %23, % → %25")
        print("=" * 50)
        return False

if __name__ == "__main__":
    test_connection()

