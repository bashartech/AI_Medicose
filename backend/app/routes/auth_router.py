"""
Auth Routes
============
Handle user authentication with Supabase.
"""

from fastapi import APIRouter, HTTPException
import os
import logging
from supabase import create_client

from app.models.schemas import UserSignup, UserLogin, UserProfile, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter()
  
# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase = create_client(supabase_url, supabase_key)


@router.post("/signup")
async def signup(user_data: UserSignup):
    """Create new user account"""
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if response.user:
            supabase.table("profiles").insert({
                "id": response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name
            }).execute()
        
        return {
            "success": True,
            "user_id": response.user.id,
            "message": "Account created successfully"
        }
    except Exception as e:
        logger.error(f"Signup error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """User login"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Get profile
        profile = supabase.table("profiles").select("*").eq("id", response.user.id).execute()
        
        return TokenResponse(
            access_token=response.session.access_token,
            token_type="bearer",
            user=UserProfile(
                id=response.user.id,
                email=profile.data[0]["email"] if profile.data else credentials.email,
                full_name=profile.data[0]["full_name"] if profile.data else None,
                created_at=None
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.get("/profile", response_model=UserProfile)
async def get_profile(user_id: str):
    """Get user profile"""
    try:
        profile = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return UserProfile(
            id=profile.data[0]["id"],
            email=profile.data[0]["email"],
            full_name=profile.data[0]["full_name"],
            date_of_birth=profile.data[0]["date_of_birth"],
            gender=profile.data[0]["gender"],
            phone=profile.data[0]["phone"],
            avatar_url=profile.data[0]["avatar_url"],
            created_at=profile.data[0]["created_at"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/profile", response_model=UserProfile)
async def update_profile(user_id: str, profile_data: dict):
    """Update user profile"""
    try:
        update_data = {k: v for k, v in profile_data.items() if v is not None}
        
        response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        
        return UserProfile(
            id=user_id,
            email=response.data[0]["email"],
            full_name=response.data[0]["full_name"],
            date_of_birth=response.data[0]["date_of_birth"],
            gender=response.data[0]["gender"],
            phone=response.data[0]["phone"],
            avatar_url=response.data[0]["avatar_url"],
            created_at=response.data[0]["created_at"]
        )
    except Exception as e:
        logger.error(f"Update profile error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout(access_token: str):
    """User logout"""
    try:
        supabase.auth.sign_out(access_token)
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
