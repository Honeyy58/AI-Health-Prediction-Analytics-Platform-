# Deployment Guide: AI Health Prediction & Analytics Platform

This guide outlines multiple production-ready deployment options:
- **[Method 1: Docker Compose](#method-1-docker-compose-recommended-for-vps--servers)** (AWS EC2, DigitalOcean, Linode, or Local Docker)
- **[Method 2: Free / Low-Cost Cloud Services](#method-2-cloud-paas-render--vercel--railway)** (Vercel Frontend + Render Backend + TiDB/Railway MySQL)
- **[Method 3: Production Linux VM (Ubuntu/Debian)](#method-3-bare-metal--ubuntu-vm-systemd--nginx)** (Nginx + Systemd + MySQL)

---

## Method 1: Docker Compose (Recommended for VPS / Servers)

A complete container stack with **MySQL 8.0**, **FastAPI Backend**, and **Nginx React Frontend** is included.

### Prerequisites
- Docker & Docker Compose installed on your host.

### Steps
1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd "Ai heath prediction & analyics system"
   ```

2. **Launch all services**:
   ```bash
   docker compose up -d --build
   ```

3. **What happens automatically**:
   - `health-mysql`: Starts MySQL 8.0 with a persistent volume (`mysql_data`) and automatically executes `database/schema.sql` on startup.
   - `health-backend`: Waits for MySQL to be healthy, loads the Scikit-Learn ML models, and starts FastAPI on port `8000`.
   - `health-frontend`: Compiles React production assets and serves them via Nginx on port `3000`, proxying `/api` requests to the backend.

4. **Access the application**:
   - **Frontend UI**: `http://<your-server-ip>:3000`
   - **FastAPI Swagger Docs**: `http://<your-server-ip>:8000/docs`
   - **Health Check**: `http://<your-server-ip>:8000/health`

5. **Stop services**:
   ```bash
   docker compose down
   ```

---

## Method 2: Cloud PaaS (Render + Vercel + Railway)

This setup is 100% free or low cost with zero server maintenance.

### 1. Database: Managed Cloud MySQL
You can get a free managed MySQL database from:
- **TiDB Cloud Serverless** (5 GiB free forever): [tidbcloud.com](https://tidbcloud.com/)
- **Railway.app** (Free MySQL template): [railway.app](https://railway.app/)
- **Aiven Cloud** (Free MySQL tier): [aiven.io](https://aiven.io/)

Once created, import `database/schema.sql`:
```bash
mysql -h <cloud-db-host> -u <cloud-user> -p<cloud-pass> <db_name> < database/schema.sql
```

---

### 2. Backend: Render.com (Web Service)
1. Push your project to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in settings:
   - **Name**: `ai-health-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
5. Under **Environment Variables**, add:
   - `DB_HOST`: `<your-cloud-db-host>`
   - `DB_PORT`: `3306` (or provided port)
   - `DB_USER`: `<your-cloud-db-user>`
   - `DB_PASSWORD`: `<your-cloud-db-password>`
   - `DB_NAME`: `<your-database-name>`
   - `PYTHONPATH`: `.`
6. Click **Deploy**. Note your live URL (e.g. `https://ai-health-backend.onrender.com`).

---

### 3. Frontend: Vercel (Fast & Global CDN)
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New...** -> **Project**.
2. Import the same GitHub repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://ai-health-backend.onrender.com` (your backend URL)
5. Click **Deploy**. Your frontend is now live with an SSL HTTPS domain!

---

## Method 3: Bare Metal / Ubuntu VM (Systemd + Nginx)

For standard VPS deployments (Ubuntu 22.04 / 24.04):

### 1. Install System Dependencies
```bash
sudo apt update && sudo apt install -y python3-pip python3-venv mysql-server nginx git
```

### 2. Configure MySQL
```bash
sudo mysql -e "CREATE DATABASE health_prediction;"
sudo mysql health_prediction < database/schema.sql
sudo mysql -e "CREATE USER 'health_user'@'localhost' IDENTIFIED BY 'StrongPass123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON health_prediction.* TO 'health_user'@'localhost'; FLUSH PRIVILEGES;"
```

### 3. Setup Python Backend & Systemd Service
```bash
cd /var/www/health-app
python3 -m venv venv
./venv/bin/pip install -r backend/requirements.txt
```

Create `/etc/systemd/system/health-backend.service`:
```ini
[Unit]
Description=AI Health Prediction FastAPI Service
After=network.target mysql.service

[Service]
User=www-data
WorkingDirectory=/var/www/health-app
Environment="PATH=/var/www/health-app/venv/bin"
Environment="PYTHONPATH=/var/www/health-app"
EnvironmentFile=/var/www/health-app/backend/.env
ExecStart=/var/www/health-app/venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --workers 2

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now health-backend
```

### 4. Build Frontend and Configure Nginx
```bash
cd /var/www/health-app/frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
```

Configure `/etc/nginx/sites-available/default`:
```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    root /var/www/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Restart Nginx:
```bash
sudo nginx -t && sudo systemctl restart nginx
```
