from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import Asset, AuditLog, Lead, OfferRule, User

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return {
        "total_leads": db.query(Lead).count(),
        "total_users": db.query(User).count(),
        "total_assets": db.query(Asset).count(),
    }


# ---------------------------------------------------------------------------
# Assets
# ---------------------------------------------------------------------------

class AssetCreate(BaseModel):
    name: str
    ticker: str
    asset_class: str
    active: bool = True
    display_order: int = 0
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    market_data_key: Optional[str] = None


class AssetUpdate(BaseModel):
    name: Optional[str] = None
    ticker: Optional[str] = None
    asset_class: Optional[str] = None
    active: Optional[bool] = None
    display_order: Optional[int] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    market_data_key: Optional[str] = None


def asset_to_dict(a: Asset) -> dict:
    return {
        "id": a.id,
        "name": a.name,
        "ticker": a.ticker,
        "asset_class": a.asset_class,
        "active": a.active,
        "display_order": a.display_order,
        "short_description": a.short_description,
        "long_description": a.long_description,
        "market_data_key": a.market_data_key,
        "created_at": a.created_at,
        "updated_at": a.updated_at,
    }


@router.get("/assets")
def list_assets(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    assets = db.query(Asset).order_by(Asset.display_order).all()
    return [asset_to_dict(a) for a in assets]


@router.post("/assets", status_code=status.HTTP_201_CREATED)
def create_asset(
    body: AssetCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    asset = Asset(**body.model_dump())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset_to_dict(asset)


@router.put("/assets/{asset_id}")
def update_asset(
    asset_id: str,
    body: AssetUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return asset_to_dict(asset)


@router.delete("/assets/{asset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.active = False
    db.commit()


# ---------------------------------------------------------------------------
# Offer Rules
# ---------------------------------------------------------------------------

class OfferRuleCreate(BaseModel):
    asset_id: str
    scenario_id: str
    term_id: str
    package_id: str
    multiplier: float
    premium_pct: float
    stop_out_pct: float
    enabled: bool = True


class OfferRuleUpdate(BaseModel):
    multiplier: Optional[float] = None
    premium_pct: Optional[float] = None
    stop_out_pct: Optional[float] = None
    enabled: Optional[bool] = None


def rule_to_dict(r: OfferRule) -> dict:
    return {
        "id": r.id,
        "asset_id": r.asset_id,
        "scenario_id": r.scenario_id,
        "term_id": r.term_id,
        "package_id": r.package_id,
        "multiplier": r.multiplier,
        "premium_pct": r.premium_pct,
        "stop_out_pct": r.stop_out_pct,
        "enabled": r.enabled,
        "created_at": r.created_at,
        "updated_at": r.updated_at,
    }


@router.get("/offer-rules")
def list_offer_rules(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    rules = db.query(OfferRule).all()
    return [rule_to_dict(r) for r in rules]


@router.post("/offer-rules", status_code=status.HTTP_201_CREATED)
def create_offer_rule(
    body: OfferRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rule = OfferRule(**body.model_dump())
    db.add(rule)
    db.flush()  # get the id before commit

    log = AuditLog(
        user_id=current_user.id,
        action="create",
        entity_type="offer_rule",
        entity_id=rule.id,
        old_value=None,
        new_value=body.model_dump(),
    )
    db.add(log)
    db.commit()
    db.refresh(rule)
    return rule_to_dict(rule)


@router.put("/offer-rules/{rule_id}")
def update_offer_rule(
    rule_id: str,
    body: OfferRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    rule = db.query(OfferRule).filter(OfferRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Offer rule not found")

    old_values = rule_to_dict(rule)
    changes = body.model_dump(exclude_none=True)
    for field, value in changes.items():
        setattr(rule, field, value)

    log = AuditLog(
        user_id=current_user.id,
        action="update",
        entity_type="offer_rule",
        entity_id=rule_id,
        old_value=old_values,
        new_value=changes,
    )
    db.add(log)
    db.commit()
    db.refresh(rule)
    return rule_to_dict(rule)


# ---------------------------------------------------------------------------
# Leads
# ---------------------------------------------------------------------------

@router.get("/leads")
def list_leads(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    leads = db.query(Lead).order_by(Lead.created_at.desc()).all()
    return [
        {
            "id": l.id,
            "name": l.name,
            "email": l.email,
            "phone": l.phone,
            "created_at": l.created_at,
            "offer_snapshot": l.offer_snapshot,
        }
        for l in leads
    ]


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.put("/users/{user_id}")
def update_user(
    user_id: str,
    body: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "role": user.role, "is_active": user.is_active}
