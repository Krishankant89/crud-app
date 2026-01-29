# Simple CRUD Web App - Task Manager

A full-stack task management application using Node.js, Express, PostgreSQL, deployed on AWS Free Tier.

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Database Admin**: pgAdmin
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git & GitHub
- **Deployment**: AWS EC2 (Free Tier)

## Features

- ✅ Create tasks
- ✅ Read/List all tasks
- ✅ Update task status
- ✅ Delete tasks
- ✅ Responsive UI
- ✅ Dockerized application
- ✅ PostgreSQL database with pgAdmin

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- AWS Account (Free Tier)
- GitHub account

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/simple-crud-app.git
cd simple-crud-app
```

### 2. Start the application with Docker Compose

```bash
docker-compose up -d
```

This will start:
- Web application on `http://localhost:3000`
- PostgreSQL database on port `5432`
- pgAdmin on `http://localhost:5050`

### 3. Access pgAdmin

1. Navigate to `http://localhost:5050`
2. Login with:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Add server:
   - Host: `postgres` (container name)
   - Port: `5432`
   - Database: `taskdb`
   - Username: `postgres`
   - Password: `postgres`

## AWS Deployment (Free Tier)

### 1. Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance:
   - AMI: Amazon Linux 2023 or Ubuntu 22.04 LTS
   - Instance type: `t2.micro` (Free Tier)
   - Create new key pair (download .pem file)
   - Security Group: Allow ports 22 (SSH), 80 (HTTP), 3000 (App)
3. Launch instance

### 2. Connect to EC2

```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

### 3. Install Docker on EC2

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
```

### 4. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/simple-crud-app.git
cd simple-crud-app

# Start application
docker-compose up -d

# Check status
docker-compose ps
```

### 5. Access Your App

Navigate to `http://your-ec2-public-ip:3000`

## Project Structure

```
simple-crud-app/
├── app/
│   ├── public/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Environment Variables

The application uses the following environment variables (configured in docker-compose.yml):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskdb
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/taskdb
```

## Git Workflow

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/simple-crud-app.git
git branch -M main
git push -u origin main
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Remove all containers and volumes
docker-compose down -v
```

## Database Schema

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Application won't start
- Check Docker is running: `docker ps`
- Check logs: `docker-compose logs`
- Rebuild containers: `docker-compose up -d --build`

### Can't connect to database
- Verify PostgreSQL container is running: `docker-compose ps`
- Check database credentials in docker-compose.yml
- Wait 10-20 seconds after starting for database to initialize

### AWS Free Tier Limits
- t2.micro instance: 750 hours/month
- 30 GB EBS storage
- 15 GB data transfer out
- Monitor usage in AWS Billing Dashboard

## License

MIT

## Author

Your Name
