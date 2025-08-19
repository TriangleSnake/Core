from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..models import User, StudentOrgProfile, SponsorProfile
from ..schemas import UserCreate, Token, UserOut, LoginInput
from ..auth import get_password_hash, verify_password, create_access_token
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"]) 

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    if session.exec(select(User).where(User.email==payload.email)).first():
        raise HTTPException(400, "Email already registered")
    user = User(email=payload.email, password_hash=get_password_hash(payload.password), role=payload.role, name=payload.name)
    session.add(user); session.commit(); session.refresh(user)
    if payload.role == "student_org":
        session.add(StudentOrgProfile(user_id=user.id))
    elif payload.role == "sponsor":
        session.add(SponsorProfile(user_id=user.id))
    session.commit()
    return user

@router.post("/login", response_model=Token)
def login(body: LoginInput, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email==body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token}

@router.get("/me", response_model=UserOut)
def me(current: User = Depends(get_current_user)):
    return current
