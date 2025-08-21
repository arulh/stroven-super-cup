import os, json
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, validator
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker
from models import Base, Player, Match, RatingHistory, Audit
from elo import update_elo
from auth import verify_signed_request, AuthError
from logger_cfg import configure_logging

HOST = os.getenv("APP_HOST", "0.0.0.0")
PORT = int(os.getenv("APP_PORT", "8000"))
DB_PATH = os.getenv("DB_PATH", "/data/fifa.sqlite")
ELO_K = float(os.getenv("ELO_K", "32"))
SIG_MAX_SKEW = int(os.getenv("SIG_MAX_SKEW_SECONDS", "300"))
NONCE_TTL = int(os.getenv("NONCE_TTL_SECONDS", "900"))
LOG_FILE = os.getenv("LOG_FILE")

log = configure_logging(LOG_FILE)
app = FastAPI(title="FIFA Pi")

# DB setup
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
Base.metadata.create_all(engine)

app.mount("/static", StaticFiles(directory="static", html=True), name="static")

class MatchIn(BaseModel):
    p1_handle: str
    p2_handle: str
    p1_score: int
    p2_score: int
    played_at: datetime

    @validator("p1_handle", "p2_handle")
    def clean_handle(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("handle required")
        return v

@app.get("/")
def root():
    return FileResponse("static/index.html")

@app.get("/healthz")
def healthz():
    return {"ok": True}

@app.get("health")
def health():
    return {"ok": True}

@app.get("/api/leaderboard")
def leaderboard():
    with SessionLocal() as db:
        rows = db.query(Player).order_by(Player.current_elo.desc()).limit(100).all()
        data = [
            {
                "handle": r.handle,
                "name": r.name,
                "elo": round(r.current_elo, 1),
                "played": r.matches_played,
                "wins": r.wins,
                "losses": r.losses,
                "win_pct": round((r.wins / r.matches_played) * 100, 1) if r.matches_played else 0.0,
            }
            for r in rows
        ]
        return {"players": data}

@app.get("/api/players")
def players():
    with SessionLocal() as db:
        rows = db.query(Player).order_by(Player.handle.asc()).all()
        return {"players": [
            {"handle": p.handle, "name": p.name, "elo": round(p.current_elo,1),
             "played": p.matches_played, "wins": p.wins, "losses": p.losses}
            for p in rows
        ]}

@app.get("/api/player/{handle}")
def player_detail(handle: str):
    with SessionLocal() as db:
        p = db.query(Player).filter(Player.handle == handle).first()
        if not p:
            raise HTTPException(status_code=404, detail="Player not found")
        recent = (
            db.query(Match)
              .filter((Match.p1_id == p.id) | (Match.p2_id == p.id))
              .order_by(Match.played_at.desc())
              .limit(20)
              .all()
        )
        return {
            "player": {"handle": p.handle, "name": p.name, "elo": round(p.current_elo,1),
                        "played": p.matches_played, "wins": p.wins, "losses": p.losses},
            "recent": [
                {"played_at": m.played_at.isoformat(),
                 "p1": db.query(Player).get(m.p1_id).handle,
                 "p2": db.query(Player).get(m.p2_id).handle,
                 "score": f"{m.p1_score}-{m.p2_score}"}
                for m in recent
            ]
        }

@app.post("/api/matches")
async def create_match(request: Request):
    body = await request.body()
    with SessionLocal() as db:
        # Auth
        try:
            key = verify_signed_request(
                db=db,
                headers=request.headers,
                method=request.method,
                path=str(request.url.path),
                body_bytes=body,
                max_skew=SIG_MAX_SKEW,
                nonce_ttl=NONCE_TTL,
            )
            sig_valid = True
        except AuthError as e:
            sig_valid = False
            db.add(Audit(
                key_id=request.headers.get("x-key-id"),
                action="create_match",
                resource_type="match",
                ip=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                signature_valid=False,
                note=str(e),
            ))
            db.commit()
            raise HTTPException(status_code=401, detail=str(e))

        data = MatchIn.parse_raw(body)
        # Players ensure
        def get_or_create(handle: str):
            p = db.query(Player).filter(Player.handle == handle).first()
            if not p:
                p = Player(handle=handle, name=handle)
                db.add(p)
                db.flush()
            return p

        p1 = get_or_create(data.p1_handle)
        p2 = get_or_create(data.p2_handle)

        # Elo update
        new_p1, new_p2 = update_elo(p1.current_elo, p2.current_elo, data.p1_score, data.p2_score, k=float(os.getenv("ELO_K","32")))

        # Persist match
        m = Match(
            played_at=data.played_at,
            p1_id=p1.id,
            p2_id=p2.id,
            p1_score=data.p1_score,
            p2_score=data.p2_score,
            created_by_key_id=key.key_id,
        )
        db.add(m)
        db.flush()

        db.add(RatingHistory(player_id=p1.id, match_id=m.id, pre_elo=p1.current_elo, post_elo=new_p1))
        db.add(RatingHistory(player_id=p2.id, match_id=m.id, pre_elo=p2.current_elo, post_elo=new_p2))

        # Update player aggregates
        p1.matches_played += 1
        p2.matches_played += 1
        if data.p1_score > data.p2_score:
            p1.wins += 1; p2.losses += 1
        elif data.p2_score > data.p1_score:
            p2.wins += 1; p1.losses += 1
        # draws don't change wins/losses
        p1.current_elo = new_p1
        p2.current_elo = new_p2

        db.add(Audit(
            key_id=key.key_id,
            action="create_match",
            resource_type="match",
            resource_id=str(m.id),
            ip=request.headers.get("cf-connecting-ip") or (request.client.host if request.client else None),
            user_agent=request.headers.get("user-agent"),
            signature_valid=sig_valid,
        ))

        db.commit()

        return {"ok": True, "match_id": m.id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)