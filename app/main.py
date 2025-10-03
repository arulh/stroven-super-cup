import os, json
from datetime import datetime, timedelta
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker
from models import Base, Player, Match, RatingHistory, Audit
from elo import update_elo
from auth import verify_signed_request, AuthError
from logger_cfg import configure_logging

HOST = os.getenv("APP_HOST", "0.0.0.0")
PORT = int(os.getenv("APP_PORT", "8000"))
DB_PATH = os.getenv("DB_PATH", "/data/rpi_09182025.sqlite")
ELO_K = float(os.getenv("ELO_K", "32"))
SIG_MAX_SKEW = int(os.getenv("SIG_MAX_SKEW_SECONDS", "300"))
NONCE_TTL = int(os.getenv("NONCE_TTL_SECONDS", "900"))
LOG_FILE = os.getenv("LOG_FILE")

log = configure_logging(LOG_FILE)
app = FastAPI(title="FIFA Pi")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    played_at: datetime = datetime.now()

    @validator("p1_handle", "p2_handle")
    def clean_handle(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("handle required")
        return v


@app.get("/")
def root():
    return FileResponse("static/index.html")


@app.get("/health")
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
              .order_by(Match.played_at.desc(), Match.id.desc())
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
    

@app.get("/api/rating-history")
def get_rating_history():
    """Get rating history for all players to show ELO progression."""
    with SessionLocal() as db:
        # Get all matches in chronological order
        matches = db.query(Match).order_by(Match.played_at.asc(), Match.id.asc()).all()

        # Get all players
        players = db.query(Player).all()
        player_map = {p.id: p.handle for p in players}

        # Track current ratings (everyone starts at 1000)
        current_ratings = {p.handle: 1000.0 for p in players}
        history = [{"match": 0, **current_ratings.copy()}]

        # Process each match to build rating history
        for i, match in enumerate(matches):
            # Get rating changes for this match
            ratings = db.query(RatingHistory).filter(
                RatingHistory.match_id == match.id
            ).all()

            # Update ratings based on this match
            for r in ratings:
                player_handle = player_map.get(r.player_id)
                if player_handle:
                    current_ratings[player_handle] = r.post_elo

            # Add snapshot after this match
            history.append({
                "match": i + 1,
                **current_ratings.copy()
            })

        return {"history": history}


@app.get("/api/matches")
def get_all_matches():
    """Get all matches with player names."""
    with SessionLocal() as db:
        matches = db.query(Match).order_by(Match.played_at.desc(), Match.id.desc()).all()
        result = []
        for m in matches:
            p1 = db.query(Player).get(m.p1_id)
            p2 = db.query(Player).get(m.p2_id)
            result.append({
                "played_at": m.played_at.isoformat(),
                "p1": p1.handle,
                "p2": p2.handle,
                "score": f"{m.p1_score}-{m.p2_score}"
            })
        return {"matches": result}


@app.get("/api/player-stats")
def get_player_stats():
    """Get all players with their all-time high ELO calculated from rating history."""
    with SessionLocal() as db:
        players = db.query(Player).all()
        result = []

        for player in players:
            # Get all rating history for this player
            history = db.query(RatingHistory).filter(
                RatingHistory.player_id == player.id
            ).all()

            # Calculate all-time high from history
            all_time_high = player.current_elo  # Start with current as minimum

            # Check all historical ratings
            for h in history:
                if h.post_elo > all_time_high:
                    all_time_high = h.post_elo
                # Also check pre_elo in case it was higher
                if h.pre_elo > all_time_high:
                    all_time_high = h.pre_elo

            result.append({
                "handle": player.handle,
                "name": player.name,
                "current_elo": round(player.current_elo, 1),
                "all_time_high": round(all_time_high, 1),
                "played": player.matches_played,
                "wins": player.wins,
                "losses": player.losses
            })

        return {"players": result}


@app.get("/add-match", response_class=FileResponse)
def get_add_match_form():
    # Assumes your working dir has ./static/add_match.html
    path = os.path.join(os.getcwd(), "static", "add_match.html")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Form not found")
    return FileResponse(path)


@app.post("/api/matches")
async def create_match_insecure(request: Request):
    body = await request.body()
    with SessionLocal() as db:
        # Auth
        key = "d8e8f851fb8e4a02"
        sig_valid = True

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
            created_by_key_id=key,
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
            key_id=key,
            action="create_match",
            resource_type="match",
            resource_id=str(m.id),
            ip=request.headers.get("cf-connecting-ip") or (request.client.host if request.client else None),
            user_agent=request.headers.get("user-agent"),
            signature_valid=sig_valid,
        ))

        db.commit()

        return {"ok": True, "match_id": m.id}


@app.post("/api/matches-secure")
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