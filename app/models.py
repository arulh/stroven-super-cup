from datetime import datetime
from sqlalchemy import (
    Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Text, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    handle = Column(String(64), nullable=False, unique=True)
    current_elo = Column(Float, nullable=False, default=1000.0)
    matches_played = Column(Integer, nullable=False, default=0)
    wins = Column(Integer, nullable=False, default=0)
    losses = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True)
    played_at = Column(DateTime, nullable=False)
    p1_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    p2_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    p1_score = Column(Integer, nullable=False)
    p2_score = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_by_key_id = Column(String(64), nullable=False)

    p1 = relationship("Player", foreign_keys=[p1_id])
    p2 = relationship("Player", foreign_keys=[p2_id])

class RatingHistory(Base):
    __tablename__ = "rating_history"
    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    match_id = Column(Integer, ForeignKey("matches.id"), nullable=False)
    pre_elo = Column(Float, nullable=False)
    post_elo = Column(Float, nullable=False)

class ApiKey(Base):
    __tablename__ = "api_keys"
    key_id = Column(String(64), primary_key=True)
    label = Column(String(80), nullable=False)
    public_key_b64 = Column(Text, nullable=False)  # Ed25519 32-byte key, base64
    can_write = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    revoked_at = Column(DateTime, nullable=True)

class Nonce(Base):
    __tablename__ = "nonces"
    nonce = Column(String(64), primary_key=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

class Audit(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, nullable=False, default=datetime.utcnow)
    key_id = Column(String(64), nullable=True)
    action = Column(String(32), nullable=False)
    resource_type = Column(String(32), nullable=True)
    resource_id = Column(String(64), nullable=True)
    ip = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
    signature_valid = Column(Boolean, nullable=False, default=False)
    note = Column(Text, nullable=True)

    __table_args__ = (
        UniqueConstraint('id', name='audit_id_unique'),
    )