"""Market data adapter — yfinance with 15-min in-memory cache and mock fallback."""
import math
import time
from datetime import datetime, timedelta

_cache: dict = {}
CACHE_TTL = 900  # 15 minutes

# Map raw tickers to yfinance symbols where they differ
YFINANCE_MAP = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
}


MOCK_PRICES = {
    "BTC":  {"price": 65000.0,  "change_1m_pct": 8.2,   "change_1y_pct": 142.0, "currency": "USD"},
    "ETH":  {"price": 3200.0,   "change_1m_pct": 5.1,   "change_1y_pct": 78.0,  "currency": "USD"},
    "GLD":  {"price": 185.0,    "change_1m_pct": 2.3,   "change_1y_pct": 18.5,  "currency": "USD"},
    "SLV":  {"price": 24.5,     "change_1m_pct": 1.8,   "change_1y_pct": 12.0,  "currency": "USD"},
    "USO":  {"price": 72.0,     "change_1m_pct": -1.4,  "change_1y_pct": -5.0,  "currency": "USD"},
    "AAPL": {"price": 185.0,    "change_1m_pct": 3.2,   "change_1y_pct": 28.0,  "currency": "USD"},
    "NVDA": {"price": 875.0,    "change_1m_pct": 12.5,  "change_1y_pct": 195.0, "currency": "USD"},
    "SPY":  {"price": 510.0,    "change_1m_pct": 2.1,   "change_1y_pct": 22.0,  "currency": "USD"},
}

DEFAULT_MOCK = {"price": 100.0, "change_1m_pct": 2.5, "change_1y_pct": 15.0, "currency": "USD"}


def _mock_price(ticker: str) -> dict:
    return dict(MOCK_PRICES.get(ticker.upper(), DEFAULT_MOCK))


def _mock_history(months: int = 6) -> list:
    days = months * 30
    base = 100.0
    result = []
    today = datetime.utcnow().date()
    for i in range(days, 0, -1):
        d = today - timedelta(days=i)
        price = base * (1 + 0.3 * math.sin(i / 20.0) + i / (days * 5))
        result.append({"date": d.isoformat(), "close": round(price, 2)})
    return result


def get_asset_price(ticker: str) -> dict:
    key = ticker.upper()
    now = time.time()

    cached = _cache.get(key)
    if cached and now - cached["fetched_at"] < CACHE_TTL:
        return cached["data"]

    try:
        import yfinance as yf

        yf_symbol = YFINANCE_MAP.get(key, key)
        t = yf.Ticker(yf_symbol)
        hist_1m = t.history(period="1mo")
        hist_1y = t.history(period="1y")

        if hist_1m.empty or hist_1y.empty:
            raise ValueError("Empty history")

        price = float(hist_1m["Close"].iloc[-1])
        price_1m_ago = float(hist_1m["Close"].iloc[0])
        price_1y_ago = float(hist_1y["Close"].iloc[0])

        change_1m_pct = round((price - price_1m_ago) / price_1m_ago * 100, 2) if price_1m_ago else 0.0
        change_1y_pct = round((price - price_1y_ago) / price_1y_ago * 100, 2) if price_1y_ago else 0.0

        info = t.fast_info
        currency = getattr(info, "currency", "USD") or "USD"

        data = {
            "price": round(price, 2),
            "change_1m_pct": change_1m_pct,
            "change_1y_pct": change_1y_pct,
            "currency": currency,
        }
    except Exception:
        data = _mock_price(key)

    _cache[key] = {"data": data, "fetched_at": now}
    return data


def get_price_history(ticker: str, months: int = 6) -> list:
    key = f"{ticker.upper()}_hist_{months}"
    now = time.time()

    cached = _cache.get(key)
    if cached and now - cached["fetched_at"] < CACHE_TTL:
        return cached["data"]

    try:
        import yfinance as yf

        yf_symbol = YFINANCE_MAP.get(ticker.upper(), ticker.upper())
        t = yf.Ticker(yf_symbol)
        hist = t.history(period=f"{months}mo", interval="1d")

        if hist.empty:
            raise ValueError("Empty history")

        data = [
            {"date": str(idx.date()), "close": round(float(row["Close"]), 2)}
            for idx, row in hist.iterrows()
        ]
    except Exception:
        data = _mock_history(months)

    _cache[key] = {"data": data, "fetched_at": now}
    return data
