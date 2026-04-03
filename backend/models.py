import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, Text,
    DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from database import Base


def new_uuid():
    return str(uuid.uuid4())


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String, nullable=False)
    ticker = Column(String, nullable=False)
    asset_class = Column(String, nullable=False)  # crypto/commodity/equity/etf
    active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    short_description = Column(Text)
    long_description = Column(Text)
    market_data_key = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    offer_rules = relationship("OfferRule", back_populates="asset")


class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String, primary_key=True, default=new_uuid)
    code = Column(String, nullable=False)  # up/down/flat
    display_title = Column(String, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    offer_rules = relationship("OfferRule", back_populates="scenario")


class Term(Base):
    __tablename__ = "terms"

    id = Column(String, primary_key=True, default=new_uuid)
    month_count = Column(Integer, nullable=False)
    display_title = Column(String, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    offer_rules = relationship("OfferRule", back_populates="term")


class ProtectionPackage(Base):
    __tablename__ = "protection_packages"

    id = Column(String, primary_key=True, default=new_uuid)
    title = Column(String, nullable=False)
    description = Column(Text)
    risk_order = Column(Integer, nullable=False, default=0)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    offer_rules = relationship("OfferRule", back_populates="package")


class OfferRule(Base):
    __tablename__ = "offer_rules"
    __table_args__ = (
        UniqueConstraint("asset_id", "scenario_id", "term_id", "package_id", name="uq_offer_rule"),
    )

    id = Column(String, primary_key=True, default=new_uuid)
    asset_id = Column(String, ForeignKey("assets.id"), nullable=False)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=False)
    term_id = Column(String, ForeignKey("terms.id"), nullable=False)
    package_id = Column(String, ForeignKey("protection_packages.id"), nullable=False)
    multiplier = Column(Float, nullable=False)
    premium_pct = Column(Float, nullable=False)
    stop_out_pct = Column(Float, nullable=False)
    enabled = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    asset = relationship("Asset", back_populates="offer_rules")
    scenario = relationship("Scenario", back_populates="offer_rules")
    term = relationship("Term", back_populates="offer_rules")
    package = relationship("ProtectionPackage", back_populates="offer_rules")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    role = Column(String, default="user", nullable=False)  # superadmin/product_admin/content_admin/sales_admin/user
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    saved_offers = relationship("SavedOffer", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String)
    email = Column(String)
    phone = Column(String)
    comment = Column(Text)
    policy_consent = Column(Boolean, default=False)
    offer_snapshot = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class SavedOffer(Base):
    __tablename__ = "saved_offers"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    offer_snapshot = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="saved_offers")


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String)
    old_value = Column(JSONB)
    new_value = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")
