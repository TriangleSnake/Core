from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..database import get_session
from ..deps import get_current_user
from ..models import StudentOrgProfile, SponsorProfile, User
from ..schemas import StudentProfileUpdate, SponsorProfileUpdate, UserOut

router = APIRouter(prefix="/profiles", tags=["profiles"]) 

@router.put("/student")
def update_student_profile(payload: StudentProfileUpdate, current=Depends(get_current_user), session: Session = Depends(get_session)):
    if current.role != "student_org":
        raise HTTPException(403, "Not student org")
    prof = session.get(StudentOrgProfile, current.id)
    if not prof:
        prof = StudentOrgProfile(user_id=current.id)
    for f, v in payload.model_dump(exclude_none=True).items():
        setattr(prof, f, v)
    session.add(prof); session.commit()
    return prof

@router.put("/sponsor")
def update_sponsor_profile(payload: SponsorProfileUpdate, current=Depends(get_current_user), session: Session = Depends(get_session)):
    if current.role != "sponsor":
        raise HTTPException(403, "Not sponsor")
    prof = session.get(SponsorProfile, current.id)
    if not prof:
        prof = SponsorProfile(user_id=current.id)
    for f, v in payload.model_dump(exclude_none=True).items():
        setattr(prof, f, v)
    session.add(prof); session.commit()
    return prof

@router.get("/{user_id}")
def read_profile(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user: raise HTTPException(404, "User not found")
    return {
        "user": UserOut.model_validate(user),
        "student": session.get(StudentOrgProfile, user_id),
        "sponsor": session.get(SponsorProfile, user_id)
    }
