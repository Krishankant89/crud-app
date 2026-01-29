# AWS Deployment Guide

## Complete Step-by-Step AWS Free Tier Deployment

### Prerequisites
- AWS Account (Free Tier eligible)
- Git installed locally
- GitHub account
- Domain name (optional, but recommended)

---

## Part 1: Prepare Your Application

### 1. Initialize Git Repository

```bash
cd simple-crud-app
git init
git add .
git commit -m "Initial commit: CRUD app with Docker"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named: `simple-crud-app`
3. Don't initialize with README (we already have one)

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/simple-crud-app.git
git branch -M main
git push -u origin main
```

---

## Part 2: AWS EC2 Setup

### 1. Launch EC2 Instance

**Navigate to EC2 Dashboard:**
1. Login to AWS Console
2. Search for "EC2" in services
3. Click "Launch Instance"

**Configure Instance:**
- **Name**: `crud-app-server`
- **AMI**: Amazon Linux 2023 (Free Tier eligible)
- **Instance Type**: `t2.micro` (Free Tier - 750 hours/month)
- **Key Pair**: 
  - Click "Create new key pair"
  - Name: `crud-app-key`
  - Type: RSA
  - Format: .pem (for Mac/Linux) or .ppk (for Windows/PuTTY)
  - Download and save securely

**Network Settings:**
- Click "Edit"
- Auto-assign public IP: Enable
- Create security group: `crud-app-sg`
- Add rules:
  - SSH (22) - Source: My IP
  - HTTP (80) - Source: Anywhere (0.0.0.0/0)
  - Custom TCP (3000) - Source: Anywhere (0.0.0.0/0)
  - Custom TCP (5050) - Source: My IP (for pgAdmin)

**Storage:**
- Size: 8 GB (Free Tier includes 30GB)
- Volume Type: gp3

**Launch Instance**

### 2. Connect to EC2

**For Mac/Linux:**
```bash
chmod 400 crud-app-key.pem
ssh -i "crud-app-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
```

**For Windows (using PuTTY):**
1. Convert .pem to .ppk using PuTTYgen
2. Use PuTTY with .ppk file
3. Host: ec2-user@YOUR_EC2_PUBLIC_IP

---

## Part 3: Install Docker on EC2

### 1. Update System

```bash
sudo yum update -y
```

### 2. Install Docker

```bash
# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker

# Enable Docker to start on boot
sudo systemctl enable docker

# Add ec2-user to docker group
sudo usermod -a -G docker ec2-user

# Verify installation
docker --version
```

### 3. Install Docker Compose

```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Create symbolic link
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

# Verify installation
docker-compose --version
```

### 4. Log out and back in

```bash
exit
# SSH back in
ssh -i "crud-app-key.pem" ec2-user@YOUR_EC2_PUBLIC_IP
```

---

## Part 4: Deploy Application

### 1. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/simple-crud-app.git
cd simple-crud-app
```

### 2. Start Application

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Verify Services

```bash
# Check containers
docker ps

# Check application logs
docker-compose logs app

# Check database logs
docker-compose logs postgres
```

---

## Part 5: Access Your Application

### Web Application
- URL: `http://YOUR_EC2_PUBLIC_IP:3000`
- You should see the Task Manager interface

### pgAdmin (Database Management)
- URL: `http://YOUR_EC2_PUBLIC_IP:5050`
- Email: `admin@admin.com`
- Password: `admin`

**Configure pgAdmin:**
1. Right-click "Servers" → Register → Server
2. General tab:
   - Name: `TaskDB`
3. Connection tab:
   - Host: `postgres` (container name)
   - Port: `5432`
   - Database: `taskdb`
   - Username: `postgres`
   - Password: `postgres`
4. Click "Save"

---

## Part 6: Production Optimizations

### 1. Use Nginx as Reverse Proxy

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add to `docker-compose.yml`:

```yaml
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app
    networks:
      - app-network
```

### 2. Environment Variables

Create `.env` file:

```env
POSTGRES_USER=your_secure_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=taskdb
NODE_ENV=production
```

Update `docker-compose.yml` to use `.env` file:

```yaml
env_file:
  - .env
```

### 3. Secure pgAdmin

For production, restrict pgAdmin access:
- Only allow your IP
- Use strong password
- Consider removing it entirely

### 4. Enable HTTPS with Let's Encrypt (Optional)

If you have a domain:

```bash
sudo yum install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

---

## Part 7: Maintenance

### Update Application

```bash
cd ~/simple-crud-app
git pull origin main
docker-compose down
docker-compose up -d --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Backup Database

```bash
# Create backup
docker exec crud_postgres pg_dump -U postgres taskdb > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20240101.sql | docker exec -i crud_postgres psql -U postgres taskdb
```

### Monitor Resources

```bash
# Check disk usage
df -h

# Check memory
free -h

# Check Docker resources
docker stats
```

### Stop Services

```bash
docker-compose down

# Stop and remove volumes (careful!)
docker-compose down -v
```

---

## Part 8: Cost Monitoring

### Free Tier Limits (First 12 Months)
- ✅ t2.micro: 750 hours/month
- ✅ 30 GB EBS storage
- ✅ 15 GB data transfer out

### Monitor Usage
1. AWS Console → Billing Dashboard
2. Set up billing alerts:
   - Services → CloudWatch → Billing
   - Create alarm for when charges exceed $1

### Best Practices
- Stop instance when not in use (don't terminate)
- Use `docker-compose down` to save resources
- Monitor CloudWatch metrics

---

## Troubleshooting

### Can't connect to EC2
- Check security group allows your IP on port 22
- Verify public IP hasn't changed
- Check instance is running

### Application not accessible
- Verify containers are running: `docker-compose ps`
- Check logs: `docker-compose logs`
- Verify security group allows port 3000

### Database connection issues
- Wait 20-30 seconds after starting for DB to initialize
- Check postgres container: `docker-compose logs postgres`
- Verify credentials in docker-compose.yml

### Out of disk space
- Clean Docker: `docker system prune -a`
- Remove old images: `docker image prune -a`
- Check volumes: `docker volume ls`

---

## Next Steps

1. **Custom Domain**: Point domain to EC2 IP
2. **HTTPS**: Set up SSL with Let's Encrypt
3. **CI/CD**: Automate deployments with GitHub Actions
4. **Monitoring**: Set up CloudWatch alarms
5. **Auto-scaling**: Configure for high traffic (exits Free Tier)

---

## Security Checklist

- [ ] Changed default database passwords
- [ ] Restricted security group rules to specific IPs
- [ ] Enabled SSH key-based authentication only
- [ ] Disabled password authentication
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Backup strategy in place
- [ ] Monitoring and alerts configured

---

## Support

For issues:
1. Check application logs
2. Review AWS CloudWatch
3. Check GitHub Issues
4. AWS Free Tier documentation

Congratulations! Your CRUD app is now live on AWS! 🎉
