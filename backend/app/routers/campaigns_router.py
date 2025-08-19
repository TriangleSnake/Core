from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..deps import get_current_user
from ..models import Campaign, User
from ..schemas import CampaignCreate, CampaignOut

router = APIRouter(prefix="/campaigns", tags=["campaigns"]) 

@router.post("", response_model=CampaignOut)
def create_campaign(payload: CampaignCreate, current: User = Depends(get_current_user), session: Session=Depends(get_session)):
    if current.role != "student_org":
        raise HTTPException(403, "Only student org can create")
    c = Campaign(owner_user_id=current.id, **payload.model_dump())
    session.add(c); session.commit(); session.refresh(c)
    return c

@router.get("", response_model=list[CampaignOut])
def list_campaigns(q: str | None = None, category: str | None = None, session: Session=Depends(get_session)):
    statement = select(Campaign)
    if q:
        statement = statement.where(Campaign.title.contains(q))
    if category:
        statement = statement.where(Campaign.category==category)
    statement = statement.order_by(Campaign.created_at.desc())
    return session.exec(statement).all()

@router.get("/{cid}", response_model=CampaignOut)
def get_campaign(cid: int, session: Session=Depends(get_session)):
    c = session.get(Campaign, cid)
    if not c: raise HTTPException(404, "Not found")
    return c
