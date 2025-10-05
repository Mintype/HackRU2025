"""
Script to delete all rows from a Supabase table
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Configuration - Change this to the table you want to clear
TABLE_NAME = "user_lesson_progress"

# Load environment variables from parent directory
import sys
from pathlib import Path

# Add parent directory to path to find .env file
parent_dir = Path(__file__).parent.parent
load_dotenv(parent_dir / '.env')

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file")

supabase: Client = create_client(supabase_url, supabase_key)

def delete_all_rows(table_name: str):
    """
    Delete all rows from the specified table
    
    Args:
        table_name: Name of the table to clear
    """
    try:
        print(f"Starting to delete all rows from table: {table_name}")
        
        # Delete all rows - using neq (not equal) with an impossible condition
        # This effectively selects all rows and deletes them
        response = supabase.table(table_name).delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        
        print(f"✓ Successfully deleted all rows from {table_name}")
        print(f"Response: {response}")
        
    except Exception as e:
        print(f"✗ Error deleting rows from {table_name}: {str(e)}")
        raise

if __name__ == "__main__":
    # Confirmation prompt
    print(f"⚠️  WARNING: This will delete ALL rows from the table '{TABLE_NAME}'")
    confirmation = input("Are you sure you want to continue? (yes/no): ")
    
    if confirmation.lower() == "yes":
        delete_all_rows(TABLE_NAME)
    else:
        print("Operation cancelled.")
