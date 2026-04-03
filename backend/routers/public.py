from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from market_data import get_asset_price, get_price_history
from models import Asset, Lead, OfferRule, ProtectionPackage, SavedOffer, Scenario, Term, User

router = APIRouter(prefix="/api", tags=["public"])


# ---------------------------------------------------------------------------
# GET /api/assets
# ---------------------------------------------------------------------------

@router.get("/assets")
def list_assets(db: Session = Depends(get_db)):
    assets = (
        db.query(Asset)
        .filter(Asset.active == True)
        .order_by(Asset.display_order)
        .all()
    )
    result = []
    for a in assets:
        price = get_asset_price(a.ticker)
        result.append({
            "id": a.id,
            "name": a.name,
            "ticker": a.ticker,
            "asset_class": a.asset_class,
            "short_description": a.short_description,
            "display_order": a.display_order,
            **price,
        })
    return result


# ---------------------------------------------------------------------------
# GET /api/assets/{asset_id}
# ---------------------------------------------------------------------------

@router.get("/assets/{asset_id}")
def get_asset(asset_id: str, db: Session = Depends(get_db)):
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id, Asset.active == True)
        .first()
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    price = get_asset_price(asset.ticker)
    history = get_price_history(asset.ticker, months=6)

    return {
        "id": asset.id,
        "name": asset.name,
        "ticker": asset.ticker,
        "asset_class": asset.asset_class,
        "short_description": asset.short_description,
        "long_description": asset.long_description,
        "display_order": asset.display_order,
        "history": history,
        **price,
    }


# ---------------------------------------------------------------------------
# GET /api/config
# ---------------------------------------------------------------------------

@router.get("/config")
def get_config(db: Session = Depends(get_db)):
    scenarios = (
        db.query(Scenario)
        .filter(Scenario.active == True)
        .order_by(Scenario.display_order)
        .all()
    )
    terms = (
        db.query(Term)
        .filter(Term.active == True)
        .order_by(Term.display_order)
        .all()
    )
    packages = (
        db.query(ProtectionPackage)
        .filter(ProtectionPackage.active == True)
        .order_by(ProtectionPackage.risk_order)
        .all()
    )
    return {
        "scenarios": [
            {"id": s.id, "code": s.code, "display_title": s.display_title}
            for s in scenarios
        ],
        "terms": [
            {"id": t.id, "month_count": t.month_count, "display_title": t.display_title}
            for t in terms
        ],
        "packages": [
            {"id": p.id, "title": p.title, "description": p.description, "risk_order": p.risk_order}
            for p in packages
        ],
    }


# ---------------------------------------------------------------------------
# POST /api/offer
# ---------------------------------------------------------------------------

class OfferRequest(BaseModel):
    asset_id: str
    scenario_id: str
    term_id: str
    package_id: str
    amount: float


@router.post("/offer")
def calculate_offer(body: OfferRequest, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == body.asset_id, Asset.active == True).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    scenario = db.query(Scenario).filter(Scenario.id == body.scenario_id, Scenario.active == True).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    term = db.query(Term).filter(Term.id == body.term_id, Term.active == True).first()
    if not term:
        raise HTTPException(status_code=404, detail="Term not found")

    package = db.query(ProtectionPackage).filter(ProtectionPackage.id == body.package_id, ProtectionPackage.active == True).first()
    if not package:
        raise HTTPException(status_code=404, detail="Protection package not found")

    rule = (
        db.query(OfferRule)
        .filter(
            OfferRule.asset_id == body.asset_id,
            OfferRule.scenario_id == body.scenario_id,
            OfferRule.term_id == body.term_id,
            OfferRule.package_id == body.package_id,
            OfferRule.enabled == True,
        )
        .first()
    )
    if not rule:
        raise HTTPException(
            status_code=404,
            detail=f"No offer rule found for this combination of asset, scenario, term, and package",
        )

    price_data = get_asset_price(asset.ticker)
    entry_price = price_data["price"]
    currency = price_data["currency"]

    position_amount = round(body.amount * rule.multiplier, 2)
    premium_cost = round(body.amount * rule.premium_pct / 100, 2)
    stop_out_price = round(entry_price * (1 - rule.stop_out_pct / 100), 2)

    return {
        "asset": {"id": asset.id, "name": asset.name, "ticker": asset.ticker},
        "scenario": {"id": scenario.id, "code": scenario.code, "display_title": scenario.display_title},
        "term": {"id": term.id, "month_count": term.month_count, "display_title": term.display_title},
        "package": {"id": package.id, "title": package.title},
        "amount": body.amount,
        "multiplier": rule.multiplier,
        "position_amount": position_amount,
        "premium_cost": premium_cost,
        "stop_out_pct": rule.stop_out_pct,
        "stop_out_price": stop_out_price,
        "entry_price": entry_price,
        "currency": currency,
    }


# ---------------------------------------------------------------------------
# POST /api/leads
# ---------------------------------------------------------------------------

class LeadRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    comment: Optional[str] = None
    policy_consent: bool
    offer_snapshot: Any = None


@router.post("/leads", status_code=status.HTTP_201_CREATED)
def create_lead(body: LeadRequest, db: Session = Depends(get_db)):
    if not body.policy_consent:
        raise HTTPException(status_code=400, detail="Policy consent is required")
    lead = Lead(
        name=body.name,
        email=body.email,
        phone=body.phone,
        comment=body.comment,
        policy_consent=body.policy_consent,
        offer_snapshot=body.offer_snapshot,
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return {"id": lead.id, "created_at": lead.created_at}


# ---------------------------------------------------------------------------
# POST /api/offers/save   (auth required)
# GET  /api/offers/saved  (auth required)
# ---------------------------------------------------------------------------

class SaveOfferRequest(BaseModel):
    offer_snapshot: Any


@router.post("/offers/save", status_code=status.HTTP_201_CREATED)
def save_offer(
    body: SaveOfferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved = SavedOffer(user_id=current_user.id, offer_snapshot=body.offer_snapshot)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return {"id": saved.id, "created_at": saved.created_at}


@router.get("/offers/saved")
def get_saved_offers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offers = (
        db.query(SavedOffer)
        .filter(SavedOffer.user_id == current_user.id)
        .order_by(SavedOffer.created_at.desc())
        .all()
    )
    return [
        {"id": o.id, "created_at": o.created_at, "offer_snapshot": o.offer_snapshot}
        for o in offers
    ]
