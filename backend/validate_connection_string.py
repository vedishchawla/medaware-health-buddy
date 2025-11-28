"""
Validate MongoDB Connection String Format
This script helps you verify your MONGO_URI is correctly formatted.
"""

import os
from dotenv import load_dotenv
import re

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")

print("=" * 60)
print("MongoDB Connection String Validator")
print("=" * 60)

if not MONGO_URI:
    print("\n❌ MONGO_URI is not set in .env file!")
    print("\n📝 Add this to your .env file:")
    print("   MONGO_URI=mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/")
    exit(1)

print(f"\n📋 Connection String (first 50 chars): {MONGO_URI[:50]}...")

# Check for common issues
issues = []

# Check if it's a placeholder
if "YOUR_MONGODB_ATLAS_CONNECTION_STRING" in MONGO_URI:
    issues.append("❌ Still using placeholder 'YOUR_MONGODB_ATLAS_CONNECTION_STRING'")

# Check for generic "cluster" name
if re.search(r'@cluster\.mongodb\.net', MONGO_URI):
    issues.append("⚠️  Using generic 'cluster' - replace with your actual cluster name")

# Check format
if not MONGO_URI.startswith(("mongodb://", "mongodb+srv://")):
    issues.append("❌ Must start with 'mongodb://' or 'mongodb+srv://'")

# Check for username:password@host pattern
if not re.search(r'://[^:]+:[^@]+@', MONGO_URI):
    issues.append("❌ Missing username:password@host pattern")

# Check for .mongodb.net
if ".mongodb.net" not in MONGO_URI:
    issues.append("⚠️  Should contain '.mongodb.net' domain")

if issues:
    print("\n⚠️  Issues found:")
    for issue in issues:
        print(f"   {issue}")
else:
    print("\n✅ Connection string format looks correct!")

print("\n" + "=" * 60)
print("📝 How to get your connection string from MongoDB Atlas:")
print("   1. Go to MongoDB Atlas Dashboard")
print("   2. Click 'Connect' on your cluster")
print("   3. Choose 'Connect your application'")
print("   4. Copy the connection string")
print("   5. Replace <password> with your actual password")
print("   6. Replace <username> with your database username")
print("=" * 60)

