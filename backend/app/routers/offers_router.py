from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from ..database import get_session
from ..deps import get_current_user
from ..models import Offer, Campaign, Match
from ..schemas import OfferCreate, OfferOut

router = APIRouter(prefix="/offers", tags=["offers"]) 

@router.post("", response_model=OfferOut)
def create_offer(payload: OfferCreate, current=Depends(get_current_user), session: Session=Depends(get_session)):
    if current.role != "sponsor":
        raise HTTPException(403, "Only sponsor can offer")
    if not session.get(Campaign, payload.campaign_id):
        raise HTTPException(404, "Campaign not found")
    o = Offer(sponsor_user_id=current.id, **payload.model_dump())
    session.add(o); session.commit(); session.refresh(o)
    return o

@router.patch("/{oid}")
def update_offer_status(oid: int, action: str, current=Depends(get_current_user), session: Session=Depends(get_session)):
    o = session.get(Offer, oid)
    if not o: raise HTTPException(404, "Offer not found")
    if action == "withdraw":
        if current.id != o.sponsor_user_id: raise HTTPException(403, "Not your offer")
        o.status = "withdrawn"
    elif action in ("accept", "reject"):
        camp = session.get(Campaign, o.campaign_id)
        if not camp: raise HTTPException(404, "Campaign not found")
        if current.id != camp.owner_user_id: raise HTTPException(403, "Not your campaign")
        o.status = "accepted" if action=="accept" else "rejected"
        if action == "accept":
            m = Match(campaign_id=camp.id, sponsor_user_id=o.sponsor_user_id)
            session.add(m)
            camp.status = "matched"
            session.add(camp)
    else:
        raise HTTPException(400, "Unknown action")
    session.add(o); session.commit()
    return {"status": o.status}
