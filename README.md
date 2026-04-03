# Struck

Structured investment product simulator.

## Stack

- **Backend**: FastAPI (Python 3.11)
- **Frontend**: React + Vite
- **Reverse proxy**: Nginx
- **Orchestration**: Docker Compose

## Quick start

```bash
cp .env.example .env
# Fill in .env values
docker compose up --build
```

- App: http://localhost/
- Health check: http://localhost/api/health

## Deploy

Edit `deploy.sh` with your server details, then:

```bash
bash deploy.sh
```
