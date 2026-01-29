# Quick Start Guide

## Get Running in 5 Minutes

### 1. Prerequisites Check

Make sure you have installed:
- [ ] Docker Desktop
- [ ] Git
- [ ] Code editor (VS Code recommended)

**Check installations:**
```bash
docker --version
docker-compose --version
git --version
```

### 2. Clone and Start

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/simple-crud-app.git
cd simple-crud-app

# Start everything with one command
docker-compose up -d

# Wait 20 seconds for database to initialize...
```

### 3. Access the Application

Open in your browser:
- **Web App**: http://localhost:3000
- **pgAdmin**: http://localhost:5050

### 4. Login to pgAdmin (Optional)

1. Go to http://localhost:5050
2. Login:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Add Server:
   - Right-click "Servers" → Register → Server
   - General tab: Name = `TaskDB`
   - Connection tab:
     - Host: `postgres`
     - Port: `5432`
     - Database: `taskdb`
     - Username: `postgres`
     - Password: `postgres`

### 5. Test the CRUD Operations

**Create a Task:**
1. Fill in the form
2. Click "Add Task"

**Read Tasks:**
- All tasks appear below the form
- Use filter dropdown to filter by status

**Update a Task:**
1. Click "Edit" on any task
2. Modify details
3. Click "Update Task"

**Delete a Task:**
1. Click "Delete" on any task
2. Confirm deletion

### Common Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Clean everything (removes data!)
docker-compose down -v
```

### Project Structure

```
simple-crud-app/
├── app/                    # Node.js application
│   ├── public/            # Frontend files
│   │   ├── index.html    # Main UI
│   │   ├── styles.css    # Styling
│   │   └── script.js     # Frontend logic
│   ├── server.js         # Express API server
│   ├── package.json      # Dependencies
│   └── Dockerfile        # App container config
├── docker-compose.yml     # Multi-container setup
├── init.sql              # Database schema
└── README.md             # Documentation
```

### Environment Details

**Database:**
- Host: localhost (or `postgres` from containers)
- Port: 5432
- Database: taskdb
- User: postgres
- Password: postgres

**Application:**
- Port: 3000
- Framework: Express.js
- Database Driver: node-postgres (pg)

**pgAdmin:**
- Port: 5050
- Default credentials in docker-compose.yml

### Troubleshooting

**Containers won't start:**
```bash
docker-compose down
docker-compose up -d
```

**Port already in use:**
```bash
# Find what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use 8080 instead
```

**Database connection failed:**
- Wait 30 seconds after starting
- Check postgres logs: `docker-compose logs postgres`
- Restart: `docker-compose restart postgres`

**Can't access pgAdmin:**
- Clear browser cache
- Try incognito/private window
- Check container: `docker-compose ps`

### Next Steps

1. ✅ Modify the code in `app/` directory
2. ✅ Rebuild: `docker-compose up -d --build`
3. ✅ Push to GitHub
4. ✅ Deploy to AWS (see DEPLOYMENT.md)

### Development Workflow

```bash
# Make changes to code
# Rebuild and restart
docker-compose up -d --build

# View logs to debug
docker-compose logs -f app

# Test in browser
# http://localhost:3000
```

That's it! You're ready to develop! 🚀
