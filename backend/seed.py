"""Seed initial reference data if tables are empty."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal
from models import Asset, Scenario, Term, ProtectionPackage


def seed():
    db = SessionLocal()
    try:
        # Assets
        if db.query(Asset).count() == 0:
            assets = [
                Asset(name="Bitcoin",  ticker="BTC",  asset_class="crypto",     display_order=1),
                Asset(name="Ethereum", ticker="ETH",  asset_class="crypto",     display_order=2),
                Asset(name="Gold",     ticker="GLD",  asset_class="commodity",  display_order=3),
                Asset(name="Silver",   ticker="SLV",  asset_class="commodity",  display_order=4),
                Asset(name="Oil",      ticker="USO",  asset_class="commodity",  display_order=5),
                Asset(name="Apple",    ticker="AAPL", asset_class="equity",     display_order=6),
                Asset(name="Nvidia",   ticker="NVDA", asset_class="equity",     display_order=7),
                Asset(name="SPY",      ticker="SPY",  asset_class="etf",        display_order=8),
            ]
            db.add_all(assets)
            db.flush()
            print(f"Inserted {len(assets)} assets")
        else:
            print("Assets already seeded, skipping")

        # Scenarios
        if db.query(Scenario).count() == 0:
            scenarios = [
                Scenario(code="up",   display_title="Up",   display_order=1),
                Scenario(code="down", display_title="Down", display_order=2),
                Scenario(code="flat", display_title="Flat", display_order=3),
            ]
            db.add_all(scenarios)
            db.flush()
            print(f"Inserted {len(scenarios)} scenarios")
        else:
            print("Scenarios already seeded, skipping")

        # Terms
        if db.query(Term).count() == 0:
            terms = [
                Term(month_count=1, display_title="1 Month",  display_order=1),
                Term(month_count=3, display_title="3 Months", display_order=2),
                Term(month_count=6, display_title="6 Months", display_order=3),
            ]
            db.add_all(terms)
            db.flush()
            print(f"Inserted {len(terms)} terms")
        else:
            print("Terms already seeded, skipping")

        # Protection packages
        if db.query(ProtectionPackage).count() == 0:
            packages = [
                ProtectionPackage(
                    title="Careful",
                    description="Low risk, high protection, lower upside",
                    risk_order=1,
                ),
                ProtectionPackage(
                    title="Balanced",
                    description="Moderate risk and upside",
                    risk_order=2,
                ),
                ProtectionPackage(
                    title="Bold",
                    description="Higher upside, less protection",
                    risk_order=3,
                ),
            ]
            db.add_all(packages)
            db.flush()
            print(f"Inserted {len(packages)} protection packages")
        else:
            print("Protection packages already seeded, skipping")

        db.commit()
        print("Seed complete.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
