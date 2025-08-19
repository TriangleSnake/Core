from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..deps import get_current_user
from ..models import Review, Match, Campaign

router = APIRouter(prefix="/reviews", tags=["reviews"]) 

@router.post("", response_model=Review)
def create_review(payload: Review, current=Depends(get_current_user), session: Session=Depends(get_session)):
    # Validate match participation
    m = session.get(Match, payload.match_id)
    if not m: raise HTTPException(404, "Match not found")
    # participants: sponsor_user_id and campaign owner
    camp = session.get(Campaign, m.campaign_id)
    valid_ids = {m.sponsor_user_id, camp.owner_user_id} if camp else {m.sponsor_user_id}
    if current.id not in valid_ids:
        raise HTTPException(403, "Not participant of this match")
    r = Review(from_user_id=current.id, to_user_id=payload.to_user_id, match_id=payload.match_id, rating=payload.rating, content=payload.content)
    session.add(r); session.commit(); session.refresh(r)
    return r

@router.get("")
def list_reviews(user_id: int, session: Session=Depends(get_session)):
    reviews = session.exec(select(Review).where(Review.to_user_id==user_id).order_by(Review.created_at.desc())).all()
    if not reviews:
        return {"reviews": [], "avg_rating": None}
    avg = sum(r.rating for r in reviews)/len(reviews)
    return {"reviews": reviews, "avg_rating": round(avg, 2)}
