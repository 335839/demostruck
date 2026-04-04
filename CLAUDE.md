# Struck — Project Context for Claude Code

## What this is
A SaaS web app that simulates structured investment products for retail users.
Users select an asset, market view, term, and protection package, then receive
a simulated offer showing a leveraged position with limited downside.
MVP goal: validate user interest and capture leads.

## Tech stack
- Backend: Python 3.11, FastAPI, SQLAlchemy, Alembic, passlib/bcrypt, python-jose
- Frontend: React + Vite (plain JS, no TypeScript), react-router-dom, axios, recharts
- Database: PostgreSQL via Supabase (connection pooler URL)
- Reverse proxy: nginx
- Containerization: Docker Compose (docker-compose v1 syntax on server)
- Deployment: AWS Lightsail ($3.50 instance), Ubuntu 22.04

## Monorepo structure
struck/
  backend/          FastAPI app
    main.py         App entry point, CORS, router registration
    models.py       SQLAlchemy models
    auth.py         JWT creation, verification, dependencies
    database.py     SQLAlchemy engine and session
    market_data.py  yfinance adapter with 15min memory cache
    seed.py         Initial data seeder
    create_admin.py CLI script to create superadmin user
    alembic/        DB migrations
    routers/
      auth.py       /api/auth/* (login, register, logout, me)
      public.py     /api/assets, /api/config, /api/offer, /api/leads,
                    /api/offers/save, /api/offers/saved, /api/cms
      admin.py      /api/admin/* (assets, offer-rules, leads, users,
                    stats, cms, audit-log)
  frontend/         React + Vite app
    src/
      api.js        Axios instance with baseURL="/api"
      App.jsx       Router and layout
      context/
        AuthContext.jsx  Auth state (user, login, logout, isAuthenticated)
      pages/
        Home.jsx         / — hero, popular assets, CMS content
        AssetList.jsx    /assets — asset grid with filters
        AssetPage.jsx    /assets/:id — chart, selectors, offer builder
        OfferPage.jsx    /offer — offer display, save, I'm Interested
        LeadForm.jsx     /lead — contact capture form
        Login.jsx        /login
        Register.jsx     /register
        Cabinet.jsx      /cabinet — saved offers (auth required)
        FAQ.jsx          /faq — CMS-driven FAQ and how it works
        admin/
          AdminLayout.jsx      Sidebar, auth/role guard
          AdminDashboard.jsx   /admin — stats
          AdminAssets.jsx      /admin/assets
          AdminOfferRules.jsx  /admin/offer-rules — matrix editor
          AdminLeads.jsx       /admin/leads
          AdminUsers.jsx       /admin/users
          AdminCMS.jsx         /admin/cms
          AdminAuditLog.jsx    /admin/audit-log (superadmin only)
  infra/
    nginx/nginx.conf  Reverse proxy config
  docker-compose.yml
  deploy.sh

## Database tables (Supabase PostgreSQL)
assets, scenarios, terms, protection_packages, offer_rules,
users, leads, saved_offers, audit_log, cms_content

## Auth
- Cookie-based JWT (httpOnly cookie named access_token)
- Roles: superadmin, product_admin, content_admin, sales_admin, user
- get_current_user dependency reads cookie
- require_admin dependency checks role

## Key business logic
- Offer calculation: position_amount = amount * multiplier
  premium_cost = amount * premium_pct / 100
  stop_out_price = entry_price * (1 - stop_out_pct / 100)
- Offer rules matrix: asset × scenario × term × package → multiplier, premium_pct, stop_out_pct
- Market data: yfinance with 15min memory cache, mock fallback

## Local dev
- cp .env.example .env and fill in DATABASE_URL, SECRET_KEY, ALLOWED_ORIGINS
- docker compose up --build
- Access at http://localhost
- Admin: admin@struck.io / Admin123struck

## Deployment
- Server: 3.120.83.162 (AWS Lightsail)
- SSH: ssh -i infra/struck-key.pem ubuntu@3.120.83.162
- Deploy: git pull && docker-compose down && docker-compose up --build -d
- Uses docker-compose v1 (not docker compose v2)
- 1GB swap file configured for low-RAM instance

## Important notes
- nginx must be restarted after rebuilds: docker-compose restart nginx
- Supabase free tier pauses after inactivity — restore at supabase.com if DB unreachable
- DATABASE_URL uses pooler: aws-0-eu-west-1.pooler.supabase.com:6543
- .env is gitignored — never commit it
- infra/struck-key.pem is gitignored — never commit it

## Current state
- All 6 iterations complete and deployed
- Home page: premium dark theme, animated particles, ticker strip,
  how it works section, footer
- Design system: dark background (#0a0a0f), gold accent (#f0b429),
  CSS variables in index.css
- Live at: http://3.120.83.162
- Last major change: premium dark home page redesign

## Known issues / TODOs
- nginx requires manual restart after docker-compose up --build
  (docker-compose restart nginx)
- Supabase free tier pauses after inactivity — restore at supabase.com
- Offer rules matrix must be populated manually via /admin/offer-rules
  before offer calculator works
- No domain or SSL yet
- No email notifications for leads yet
- Password reset flow is API-ready but no UI yet
