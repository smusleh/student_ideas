# Student Ideas

A web-based application that allows students to submit ideas and browse them on a collaborative dashboard. Ideas can be upvoted, filtered, and searched in real-time.

## Features

- **Submit ideas** — Title, description, name, category, and email (all except title/description are optional)
- **Browse dashboard** — View all ideas as a responsive card grid
- **Search & filter** — Find ideas by keyword or category
- **Sort** — Order by newest or most voted
- **Upvote** — Increment vote counts on ideas
- **Export CSV** — Download all ideas from the database as a CSV file
- **Persistent storage** — SQLite database with Alembic migrations

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite |
| Backend | Python + FastAPI + uvicorn |
| Database | SQLite + SQLAlchemy ORM + Alembic |
| Containerization | Docker + Docker Compose |

## Architecture

```
┌─────────────────────────────────────────┐
│         Public (Port 3000)              │
├─────────────────────────────────────────┤
│  Nginx (reverse proxy + static files)   │
│  - Serves React build                   │
│  - Proxies /api → backend:8000          │
├─────────────────────────────────────────┤
│  FastAPI Backend (Port 8000, internal)  │
│  - GET  /api/ideas                      │
│  - GET  /api/ideas/export               │
│  - GET  /api/categories                 │
│  - POST /api/ideas                      │
│  - POST /api/ideas/{id}/upvote          │
├─────────────────────────────────────────┤
│     SQLite (Docker named volume)        │
│     /app/data/ideas.db                  │
└─────────────────────────────────────────┘
```

---

## Prerequisites

### For Local Development (without Docker)

- **Python 3.12+** with pip
- **Node.js 20+** with npm
- Optional: Unix-like shell (for `start.sh`)

### For Docker Deployment

- **Docker** 20.10+
- **Docker Compose** 2.0+

---

## Local Development

### Option 1: Using Docker (Recommended)

```bash
cd ~/student-ideas
docker compose up --build
```

Then open **http://localhost:3000** in your browser.

To stop:
```bash
docker compose down
```

To stop and wipe the database:
```bash
docker compose down -v
```

### Option 2: Running Natively

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

**Run both services** (in separate terminals):

Terminal 1:
```bash
cd backend
alembic upgrade head
uvicorn main:app --reload --port 8000
```

Terminal 2:
```bash
cd frontend
npm run dev  # dev server on http://localhost:5173, proxies /api to :8000
```

Or use the provided `start.sh`:
```bash
./start.sh
```

---

## Production Deployment on Linux

### Step 1: Server Setup

Provision a Linux server (Ubuntu 22.04 LTS recommended) and SSH into it.

**Install Docker & Docker Compose:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git

# Allow current user to run docker without sudo (optional but recommended)
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Clone & Deploy

```bash
# Clone the repo
git clone <your-repo-url> student-ideas
cd student-ideas

# Start the application
docker compose up -d --build

# Verify it's running
docker compose logs -f
```

The app is now running on `http://<server-ip>:3000` (local network only).

### Step 3: Make It Publicly Accessible

#### Option A: Using Nginx Reverse Proxy (Recommended)

**Install Nginx:**
```bash
sudo apt install -y nginx
```

**Create Nginx config** at `/etc/nginx/sites-available/student-ideas`:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/student-ideas /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site if needed
sudo nginx -t  # Verify config
sudo systemctl restart nginx
```

Now the app is accessible at `http://your-domain.com` or `http://<server-ip>`.

#### Option B: Expose Docker Port Directly

Edit `docker-compose.yml` and change the frontend port mapping:
```yaml
frontend:
  ports:
    - "80:80"  # Expose port 80 directly (requires no other services on port 80)
```

Then restart:
```bash
docker compose up -d
```

**⚠️ Security note:** This exposes the app directly. Use Option A (Nginx) for better control and future flexibility.

### Step 4: Enable HTTPS (Recommended)

Use Certbot to get a free SSL certificate from Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx

# Run Certbot (replace your-domain.com with your actual domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal check
sudo systemctl status certbot.timer
```

Nginx config will be automatically updated with HTTPS. Access the app via `https://your-domain.com`.

### Step 5: (Optional) Configure Custom Domain

If using a custom domain:
1. Update your domain registrar's DNS records to point to your server's IP
2. Wait for propagation (can take a few minutes to hours)
3. Access via `http://your-domain.com` (or `https://` if you set up SSL)

---

## Database Management

### View Database Contents (Docker)

```bash
docker exec student-ideas-backend-1 sqlite3 /app/data/ideas.db ".tables"
docker exec student-ideas-backend-1 sqlite3 /app/data/ideas.db "SELECT * FROM ideas;"
```

### Run Migrations

Migrations run automatically on container startup, but you can manually run them:

```bash
docker exec student-ideas-backend-1 alembic upgrade head
```

### Create a New Migration

After changing `backend/models.py`:

```bash
docker exec student-ideas-backend-1 alembic revision --autogenerate -m "describe your change"
```

Then restart the container:
```bash
docker compose restart backend
```

---

## Monitoring & Logs

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Last N lines
docker compose logs --tail=50
```

### Check Container Status

```bash
docker compose ps
```

### Restart Services

```bash
docker compose restart              # Restart all
docker compose restart backend      # Restart just backend
docker compose restart frontend     # Restart just frontend
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, update `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "8080:80"  # Use 8080 instead
```

Then restart: `docker compose up -d`

### Database Locked Error

This typically means Alembic is running migrations. Wait a few seconds and try again. If persistent:
```bash
docker compose restart backend
```

### Ideas Not Persisting After Restart

Verify the volume exists:
```bash
docker volume ls | grep student-ideas
```

If missing, restart:
```bash
docker compose down -v
docker compose up -d
```

### Can't Access from Public Network

1. Check firewall rules allow port 3000 (or 80/443 if using Nginx + SSL)
2. Verify server IP is correct: `curl http://localhost:3000` (on the server)
3. Check Nginx is running: `sudo systemctl status nginx`
4. Check Docker containers are healthy: `docker compose ps`

---

## Development Workflow

### Adding a New Idea Field

1. Update the database model in `backend/models.py`
2. Generate a migration: `alembic revision --autogenerate -m "add field name"`
3. Review the migration in `backend/alembic/versions/`
4. Update the `IdeaCreate` and `IdeaResponse` Pydantic schemas
5. Restart the backend: `docker compose restart backend`

### Updating Frontend Styles

Edit `frontend/src/**/*.jsx` or `frontend/src/index.css`. In dev mode (`npm run dev`), changes reload instantly. In Docker, rebuild:
```bash
docker compose up -d --build frontend
```

### Updating Backend Logic

Edit `backend/main.py` or related files. In dev mode (`--reload`), changes reload automatically. In Docker, restart:
```bash
docker compose restart backend
```

---

## File Structure

```
student-ideas/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # SQLAlchemy setup
│   ├── models.py            # ORM models + Pydantic schemas
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile           # Backend image
│   ├── .dockerignore
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/        # Migration files
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── main.jsx         # React entry point
│   │   ├── App.jsx          # Root component
│   │   ├── index.css
│   │   └── components/      # React components
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile           # Frontend image (multi-stage)
│   ├── nginx.conf           # Nginx config
│   ├── .dockerignore
│   └── index.html
├── docker-compose.yml       # Container orchestration
├── start.sh                 # Local dev launcher
└── README.md                # This file
```

---

## API Reference

### GET `/api/ideas`

Fetch all ideas with optional filtering and sorting.

**Query Parameters:**
- `search` (string, optional) — Case-insensitive search on title or description
- `category` (string, optional) — Exact match filter by category
- `sort` (string, default: `newest`) — Sort order: `newest` or `votes`

**Example:**
```bash
curl "http://localhost:3000/api/ideas?search=solar&sort=votes"
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Solar panels on the roof",
    "description": "Reduce energy costs...",
    "student_name": "Sam",
    "category": "Sustainability",
    "contact_email": "sam@example.com",
    "votes": 5,
    "created_at": "2026-05-02T15:00:00.000000"
  }
]
```

### GET `/api/ideas/export`

Download all ideas from the database as a CSV file, ordered by newest first.

**Columns:** `id`, `title`, `description`, `student_name`, `category`, `contact_email`, `votes`, `created_at`

**Response:** `text/csv` file attachment (`ideas.csv`) — always exports the full dataset regardless of any active filters.

**Example:**
```bash
curl -O http://localhost:3000/api/ideas/export
```

---

### GET `/api/categories`

Fetch all unique categories (for the category filter dropdown).

**Response:**
```json
["Infrastructure", "Sustainability", "Technology"]
```

### POST `/api/ideas`

Submit a new idea.

**Request Body:**
```json
{
  "title": "Solar panels on the roof",
  "description": "Reduce energy costs and carbon footprint...",
  "student_name": "Sam",
  "category": "Sustainability",
  "contact_email": "sam@example.com"
}
```

Only `title` and `description` are required.

**Response:** The created idea object (same as GET response).

### POST `/api/ideas/{id}/upvote`

Increment the vote count for an idea.

**Response:** The updated idea object.

---

## Performance & Scaling

### For Small Teams (< 100 students)

Current setup is sufficient. Single Docker instance on a modest server (1 CPU, 2GB RAM) easily handles this load.

### For Larger Deployments

- **Add a database proxy** (e.g., PgBouncer) if SQLite becomes a bottleneck
- **Switch to PostgreSQL** for concurrent write safety
- **Add a load balancer** to distribute traffic across multiple backend instances
- **Use Redis** for session caching and upvote deduplication
- **Implement a CDN** for static assets

These are future enhancements — not needed initially.

---

## Support & Contributing

For issues, feature requests, or contributions, open an issue or PR in the repository.

---

## License

MIT (or your preferred license)
