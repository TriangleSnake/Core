from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, date

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: str  # 'student_org' | 'sponsor' | 'admin'
    name: str
    avatar_url: Optional[str] = None

    student_profile: "StudentOrgProfile" = Relationship(back_populates="user")
    sponsor_profile: "SponsorProfile" = Relationship(back_populates="user")

class StudentOrgProfile(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    school: Optional[str] = None
    club_name: Optional[str] = None
    about: Optional[str] = None
    tags: Optional[str] = None  # csv
    socials: Optional[str] = None  # json string
    user: User = Relationship(back_populates="student_profile")

class SponsorProfile(SQLModel, table=True):
    user_id: int = Field(primary_key=True, foreign_key="user.id")
    company: Optional[str] = None
    brand: Optional[str] = None
    about: Optional[str] = None
    categories: Optional[str] = None
    website: Optional[str] = None
    user: User = Relationship(back_populates="sponsor_profile")

class Campaign(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_user_id: int = Field(foreign_key="user.id")
    title: str
    description: str
    category: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    exposure_assets: Optional[str] = None  # json string
    status: str = "open"  # draft|open|matched|closed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Offer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sponsor_user_id: int = Field(foreign_key="user.id")
    campaign_id: int = Field(foreign_key="campaign.id")
    type: str  # cash|in-kind|mixed
    amount_cash: Optional[int] = None
    items: Optional[str] = None  # json string
    conditions: Optional[str] = None
    status: str = "pending"  # pending|accepted|rejected|withdrawn
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Match(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    campaign_id: int = Field(foreign_key="campaign.id")
    sponsor_user_id: int = Field(foreign_key="user.id")
    agreement: Optional[str] = None
    status: str = "ongoing"  # ongoing|completed|disputed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    from_user_id: int = Field(foreign_key="user.id")
    to_user_id: int = Field(foreign_key="user.id")
    match_id: int = Field(foreign_key="match.id")
    rating: int
    content: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
