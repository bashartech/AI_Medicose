"""
Quick diagnostic script to test Supabase connection
Run this from the backend directory: python test_connection.py
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("=" * 50)
print("Testing Supabase Connection")
print("=" * 50)

# Check environment variables
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"\nSUPABASE_URL: {supabase_url}")
print(f"SUPABASE_KEY: {supabase_key[:30]}...{supabase_key[-10:]}" if supabase_key and len(supabase_key) > 40 else "NOT FOUND")

if not supabase_url or not supabase_key:
    print("\n❌ ERROR: Supabase credentials not found in .env file!")
    print("Make sure you're running this from the backend/ directory")
    exit(1)

# Test connection
try:
    from supabase import create_client
    supabase = create_client(supabase_url, supabase_key)
    
    # Try to query a table
    response = supabase.table("medical_reports").select("id").limit(1).execute()
    
    print("\n✅ SUCCESS: Connected to Supabase and queried database!")
    print(f"Response: {response.data}")
    
except Exception as e:
    print(f"\n❌ FAILED: {e}")
    print("\nPossible causes:")
    print("1. Database tables don't exist - Run the migration SQL")
    print("2. API key is invalid - Check your Supabase dashboard")
    print("3. Network issue - Check your internet connection")
