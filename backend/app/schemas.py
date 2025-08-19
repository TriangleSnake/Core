from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import date, datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    name: str

class LoginInput(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    name: str
    class Config:
        from_attributes = True

class StudentProfileUpdate(BaseModel):
    school: Optional[str] = None
    club_name: Optional[str] = None
    about: Optional[str] = None
    tags: Optional[str] = None
    socials: Optional[str] = None

class SponsorProfileUpdate(BaseModel):
    company: Optional[str] = None
    brand: Optional[str] = None
    about: Optional[str] = None
    categories: Optional[str] = None
    website: Optional[str] = None

class CampaignCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    exposure_assets: Optional[str] = None

class CampaignOut(CampaignCreate):
    id: int
    owner_user_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class OfferCreate(BaseModel):
    campaign_id: int
    type: str
    amount_cash: Optional[int] = None
    items: Optional[str] = None
    conditions: Optional[str] = None

class OfferOut(OfferCreate):
    id: int
    sponsor_user_id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    to_user_id: int
    match_id: int
    rating: int
    content: Optional[str] = None

class ReviewOut(ReviewCreate):
    id: int
    from_user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
