from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routers import auth_router, profiles_router, campaigns_router, offers_router, reviews_router

app = FastAPI(title="CampusSponsorship API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(profiles_router.router)
app.include_router(campaigns_router.router)
app.include_router(offers_router.router)
app.include_router(reviews_router.router)

@app.on_event("startup")
async def on_startup():
    init_db()

@app.get("/")
def root():
    return {"ok": True}
